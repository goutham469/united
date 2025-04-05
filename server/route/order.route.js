import { Router } from 'express'
import auth from '../middleware/auth.js'
import { CashFreeOnlinePaymentInitiatorController, cashfreeWebhook, CashOnDeliveryOrderController, deleteOrdersController, getAllOrdersController, getAllOrdersStatsController, getOrderDetailsController, grantAccessController, OnlinePaymentOrderController, paymentController, VerifyPaymentController, webhookStripe } from '../controllers/order.controller.js'

const orderRouter = Router()

orderRouter.post("/cash-on-delivery",auth,CashOnDeliveryOrderController)
orderRouter.post('/checkout',auth,paymentController)
orderRouter.post('/webhook',webhookStripe)
orderRouter.get("/order-list",auth,getOrderDetailsController)

orderRouter.post('/create-order',auth,OnlinePaymentOrderController)
orderRouter.post('/verify-payment',VerifyPaymentController)
// Webhook to handle Cashfree payment status
orderRouter.post('/payment-webhook', cashfreeWebhook)

orderRouter.post('/create-order-cashfree',auth,CashFreeOnlinePaymentInitiatorController)

orderRouter.get('/all-orders',getAllOrdersController)
orderRouter.get('/sales',getAllOrdersStatsController)
orderRouter.post('/deletePayment',deleteOrdersController)
orderRouter.post('/grantAccess' , grantAccessController)



export default orderRouter