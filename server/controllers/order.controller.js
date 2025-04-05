import Stripe from "../config/stripe.js";
import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import mongoose from "mongoose";
import Razorpay from "razorpay";
import { Cashfree } from "cashfree-pg"

import { ObjectId } from "mongoose";
import sendEmail from "../config/sendEmail.js";
import { product_template } from "../templates/product.js";

 export async function CashOnDeliveryOrderController(request,response){

    try {
        const userId = request.userId // auth middleware 
        const { list_items, totalAmt, addressId,subTotalAmt } = request.body 

        const payload = list_items.map(el => {
            return({
                userId : userId,
                orderId : `ORD-${new mongoose.Types.ObjectId()}`,
                productId : el.productId._id, 
                product_details : {
                    name : el.productId.name,
                    image : el.productId.image,
                    more_details : el.productId.more_details
                } ,
                paymentId : "",
                payment_status : "CASH ON DELIVERY",
                delivery_address : addressId ,
                subTotalAmt  : subTotalAmt,
                totalAmt  :  totalAmt,
            })
        })

        const generatedOrder = await OrderModel.insertMany(payload)

        ///remove from the cart
        const removeCartItems = await CartProductModel.deleteMany({ userId : userId })
        const updateInUser = await UserModel.updateOne({ _id : userId }, { shopping_cart : []})

        return response.json({
            message : "Order successfully",
            error : false,
            success : true,
            data : generatedOrder
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error ,
            error : true,
            success : false
        })
    }
}



// Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create an order with Razorpay and store in the database
export async function OnlinePaymentOrderController(req, res) 
{

  console.log("\n\nnew payment came : ")
  console.log(req.body)
  try {
    const userId = req.userId; // authenticated user ID
    const { list_items, totalAmt, addressId, subTotalAmt } = req.body;

    console.log("userId created by auth middleware : ",userId)

    

    // Create a Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmt * 100, // amount in smallest currency unit (paisa)
      currency: "INR",
      receipt: `receipt_order_${new mongoose.Types.ObjectId()}`,
      notes: {
        userId: userId,
      },
    });

    const orderIdAsString = String(razorpayOrder.id);
    console.log("orderIdAsString : ",orderIdAsString)

    // Prepare payload for MongoDB
    const payload = list_items.map((el) => ({
      userId: userId,
      orderId: orderIdAsString ,
      productId: el.productId._id,
      product_details: {
        name: el.productId.name,
        image: el.productId.image,
        more_details: el.productId.more_details
      },
      paymentId: "", // Will update after successful payment
      payment_status: "PENDING",
      delivery_address: 'addressId',
      subTotalAmt: subTotalAmt,
      totalAmt: totalAmt,
    }));

    console.log("payload to insert into DB : ",payload)
    console.log("address : ",payload[0].delivery_address)



    console.log("new payload : ",payload)
    let generatedOrder = ''

    try
    {
      generatedOrder = await OrderModel.insertMany(payload);
    }
    catch(err){
      console.log("problem in insertion at DB")
      console.log(err)

      return res.status(500).json({
        message: err.message || 'problem in insertion at DB',
        error: true,
        success: false
      });
    }

    console.log("generatedOrder : ",generatedOrder)
    

    ///remove from the cart
    const removeCartItems = await CartProductModel.deleteMany({ userId : userId })
    const updateInUser = await UserModel.updateOne({ _id : userId }, { shopping_cart : [] })

    console.log("removeCartItems : ",removeCartItems)
    console.log("updateInUser : ",updateInUser)

    return res.json({
      message: "Order initiated",
      error: false,
      success: true,
      orderId: razorpayOrder.id, // Send this to frontend
      data: generatedOrder
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
}

// Verify Razorpay payment and update order
export async function VerifyPaymentController(req, res) {
  try {
    console.log("\n\n\n\nnew payment verification came : ",req.body)

    const {  orderId } = req.body; 

    console.log("payment id : ",orderId)

    // Update order details in DB upon successful payment
    const updatedOrder = await OrderModel.updateMany(
      { orderId: orderId },
      {
        paymentId: orderId,
        payment_status: "PAID"
      }
    );

    let orders = await OrderModel.find(  { orderId: orderId }   ).populate("userId").exec();
    console.log(orders);

    for (const order of orders) {
      console.log("drive url : ", order?.product_details?.more_details?.driveLink);
      console.log("userEmail : ", order?.userId?.email);
      console.log("product name : ", order?.product_details?.name);
    
      const template = product_template(order?.product_details?.more_details?.driveLink);
      try {
        const email_status = await sendEmail(order?.userId?.email, order?.product_details?.name, template);
        console.log(email_status);
      } catch (emailError) {
        console.error("Error sending email:", emailError);
      }
    }

    console.log("updatedOrder : ",updatedOrder)

    return res.json({
      message: "Payment successful",
      error: false,
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
}

// cashfree integrations
Cashfree.XClientId = process.env.CASHFREE_CLIENT_ID
Cashfree.XClientSecret = process.env.CASHFREE_CLIENT_SECRET
Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;

async function generateCashFreeOrder(customer_details) {
  try {
      const response = await Cashfree.PGCreateOrder("2023-08-01", customer_details);
      console.log("CashFree Order created successfully:", response.data);
      return response.data; // Return the order data
  } catch (error) {
      console.error("cashfree generation function :-\n Error:", error.response?.data?.message || error.message);
      return {}; // Return an empty object on error
  }
}

// cashfree payment initiation
export async function CashFreeOnlinePaymentInitiatorController(req,res)
{
  // console.log("\n\nnew payment came via cashFree : ")
  console.log("CashFreeOnlinePaymentInitiatorController")
  console.log(req.body)
  try {
    const userId = req.userId; // authenticated user ID
    const { list_items, order_amount, addressId, subTotalAmt,order_id } = req.body;

    // console.log("userId created by auth middleware : ",userId)

    // Create a Razorpay order
    const cashfreeOrder = await generateCashFreeOrder({
        "order_amount": order_amount ,
        "order_currency": "INR",
        "order_id": order_id ,
        "customer_details": {
            "customer_id": userId,
            "customer_phone": "9398141936",
            "customer_name":order_id
        },
        "order_meta": {
            "return_url": `${process.env.FRONTEND_URL}/dashboard/myorders`,
            "notify_url":`${process.env.SERVER_URL}/api/order/payment-webhook`
        }
    })

    console.log(cashfreeOrder)

    const orderIdAsString = cashfreeOrder.payment_session_id;
    // console.log("orderIdAsString : ",orderIdAsString)

    // Prepare payload for MongoDB
    const payload = list_items?.map((el) => ({
      userId: userId,
      orderId: order_id ,
      productId: el.productId._id,
      product_details: {
        name: el.productId.name,
        image: el.productId.image,
        more_details: el.productId.more_details
      },
      paymentId: "", // Will update after successful payment
      payment_status: "PENDING",
      delivery_address: 'addressId',
      subTotalAmt: subTotalAmt,
      totalAmt: order_amount,
    }));

    // console.log("payload to insert into DB : ",payload) 



    // console.log("new payload : ",payload)
    let generatedOrder = ''

    try
    {
      generatedOrder = await OrderModel.insertMany(payload);
    }
    catch(err){
      console.log("problem in insertion at DB")
      console.log(err)

      return res.status(500).json({
        message: err.message || 'problem in insertion at DB',
        error: true,
        success: false
      });
    }

    

    ///remove from the cart
    const removeCartItems = await CartProductModel.deleteMany({ userId : userId })
    const updateInUser = await UserModel.updateOne({ _id : userId }, { shopping_cart : [] })

    // console.log("removeCartItems : ",removeCartItems)
    // console.log("updateInUser : ",updateInUser)

    return res.json({
      message: "Order initiated",
      error: false,
      success: true,
      orderId: cashfreeOrder.payment_session_id, // Send this to frontend
      data: generatedOrder
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
}

// web hook
export async function cashfreeWebhook(req, res) {
  console.log("cashfree-webhook")

  console.log(req.body)
  const paymentStatus = req.body; // Cashfree sends payment status here

  console.log("paymentStatus.data : ",paymentStatus.data)
  console.log("paymentStatus.data.payment" , paymentStatus.data.payment)

  // Check if the payment was successful
  if (paymentStatus?.data.payment?.payment_status == 'SUCCESS') {
      // Handle success (e.g., update order status in your DB)
      console.log('Payment Successful for Order:', paymentStatus.data.order.order_id  );

      // Update order details in DB upon successful payment
      const updatedOrder = await OrderModel.updateMany(
        { orderId: paymentStatus.data.order.order_id },
        {
          paymentId: paymentStatus.data.order.order_id,
          payment_status: "PAID"
        }
      );

      let orders = await OrderModel.find(  { orderId: paymentStatus.data.order.order_id  }   ).populate("userId").exec();
      console.log(orders);

      for (const order of orders) {
        console.log("drive url : ", order?.product_details?.more_details?.driveLink);
        console.log("userEmail : ", order?.userId?.email);
        console.log("product name : ", order?.product_details?.name);
      
        const template = product_template(order?.product_details?.more_details?.driveLink);
        try {
          const email_status = await sendEmail(order?.userId?.email, order?.product_details?.name, template);
          console.log(email_status);
        } catch (emailError) {
          console.error("Error sending email:", emailError);
        }
      }

      console.log("updatedOrder : ",updatedOrder)


      return res.json({
        message: "Payment successful",
        error: false,
        success: true,
        data: updatedOrder
      });

  } else {
      console.log('Payment Failed for Order:', paymentStatus.orderId);
      return res.status(400).send('Payment Failed');
  }
}






export const pricewithDiscount = (price,dis = 1)=>{
    const discountAmout = Math.ceil((Number(price) * Number(dis)) / 100)
    const actualPrice = Number(price) - Number(discountAmout)
    return actualPrice
}

export async function paymentController(request,response){
    try {
        const userId = request.userId // auth middleware 
        const { list_items, totalAmt, addressId,subTotalAmt } = request.body 

        const user = await UserModel.findById(userId)

        const line_items  = list_items.map(item =>{
            return{
               price_data : {
                    currency : 'inr',
                    product_data : {
                        name : item.productId.name,
                        images : item.productId.image,
                        more_details : item.productId.more_details,
                        metadata : {
                            productId : item.productId._id
                        },

                    },
                    unit_amount : pricewithDiscount(item.productId.price,item.productId.discount) * 100   
               },
               adjustable_quantity : {
                    enabled : true,
                    minimum : 1
               },
               quantity : item.quantity 
            }
        })

        const params = {
            submit_type : 'pay',
            mode : 'payment',
            payment_method_types : ['card'],
            customer_email : user.email,
            metadata : {
                userId : userId,
                addressId : addressId
            },
            line_items : line_items,
            success_url : `${process.env.FRONTEND_URL}/success`,
            cancel_url : `${process.env.FRONTEND_URL}/cancel`

        }

        const session = await Stripe.checkout.sessions.create(params)

        return response.status(200).json(session)

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}


const getOrderProductItems = async({
    lineItems,
    userId,
    addressId,
    paymentId,
    payment_status,
 })=>{
    const productList = []

    if(lineItems?.data?.length){
        for(const item of lineItems.data){
            const product = await Stripe.products.retrieve(item.price.product)

            const paylod = {
                userId : userId,
                orderId : `ORD-${new mongoose.Types.ObjectId()}`,
                productId : product.metadata.productId, 
                product_details : {
                    name : product.name,
                    image : product.images,

                } ,
                paymentId : paymentId,
                payment_status : payment_status,
                delivery_address : addressId,
                subTotalAmt  : Number(item.amount_total / 100),
                totalAmt  :  Number(item.amount_total / 100),
            }

            productList.push(paylod)
        }
    }

    return productList
}

//http://localhost:8080/api/order/webhook
export async function webhookStripe(request,response){
    const event = request.body;
    const endPointSecret = process.env.STRIPE_ENPOINT_WEBHOOK_SECRET_KEY

    console.log("event",event)

    // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const lineItems = await Stripe.checkout.sessions.listLineItems(session.id)
      const userId = session.metadata.userId
      const orderProduct = await getOrderProductItems(
        {
            lineItems : lineItems,
            userId : userId,
            addressId : session.metadata.addressId,
            paymentId  : session.payment_intent,
            payment_status : session.payment_status,
        })
    
      const order = await OrderModel.insertMany(orderProduct)

        console.log(order)
        if(Boolean(order[0])){
            const removeCartItems = await  UserModel.findByIdAndUpdate(userId,{
                shopping_cart : []
            })
            const removeCartProductDB = await CartProductModel.deleteMany({ userId : userId})
        }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  response.json({received: true});
}


export async function getOrderDetailsController(request,response){
    try {
        const userId = request.userId // order id

        const orderlist = await OrderModel.find({ userId : userId }).sort({ createdAt : -1 }).populate('delivery_address')

        return response.json({
            message : "order list",
            data : orderlist,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export async function getAllOrdersController(request,response){
  try {

      const orderlist = await OrderModel.find().sort({ createdAt : -1 })

      return response.json({
          message : "orders list",
          data : orderlist,
          error : false,
          success : true
      })
  } catch (error) {
      return response.status(500).json({
          message : error.message || error,
          error : true,
          success : false
      })
  }
}
function rollupSalesByDate(sales) {
  return sales.reduce((acc, sale) => {
    const date = new Date(sale.createdAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');

    // Initialize year, month, and day if not already present
    if (!acc[year]) acc[year] = {};
    if (!acc[year][month]) acc[year][month] = {};
    if (!acc[year][month][day]) acc[year][month][day] = { totalSales: 0, sales: [] };

    // Add current sale's totalAmt to the day's totalSales
    acc[year][month][day].totalSales += sale.totalAmt;

    // Add the sale to the sales list
    acc[year][month][day].sales.push(sale);

    return acc;
  }, {});
}


export async function getAllOrdersStatsController(request,response){
  try {

      let orderlist = await OrderModel.find( { payment_status : "PAID" } , {product_details:0, _id:0,orderId:0,productId:0,delivery_address:0, invoice_receipt:0,__v:0,payment_status:0,subTotalAmt:0,updatedAt:0}).sort({ createdAt : -1 });

      orderlist = rollupSalesByDate(orderlist);

      return response.json({
          message : "orders list",
          data : orderlist,
          error : false,
          success : true
      })
  } catch (error) {
      return response.status(500).json({
          message : error.message || error,
          error : true,
          success : false
      })
  }
}

export async function deleteOrdersController(request,response){
  try {

      const orderlist = await OrderModel.deleteMany({paymentId : request.body.paymentId})
      console.log("an order deleted ","paymentId = ",request.body.paymentId,"status : ",orderlist)

      return response.json({
          message : "deleted",
          data : orderlist,
          error : false,
          success : true
      })
  } catch (error) {
      return response.status(500).json({
          message : error.message || error,
          error : true,
          success : false
      })
  }
}

export async function grantAccessController(request,response){
  try {
    console.log(request.body)

      const orderlist = await OrderModel.updateOne(  { _id: new ObjectId(request.body.orderId) } , {$set:{ payment_status:'PAID' , paymentId:'ACCESS GRANTED'}})
      console.log("an access granted . ","orderId = ",request.body.orderId,"status : ",orderlist)

      return response.json({
          message : "access granted",
          data : orderlist,
          error : false,
          success : true
      })
  } catch (error) {
      return response.status(500).json({
          message : error.message || error,
          error : true,
          success : false
      })
  }
}

