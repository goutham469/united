import React, { useState } from 'react'
import { useGlobalContext } from '../provider/GlobalProvider'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import AddAddress from '../components/AddAddress'
import { useSelector } from 'react-redux'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import RazorpayPaymentButton from '../components/RazorpayPaymentButton '

import sale from '../assets/sale.png'
import CreateCashFreeOrder from '../components/CreateCashFreeOrder'

const CheckoutPage = () => {
  const { notDiscountTotalPrice, totalPrice, totalQty, fetchCartItem,fetchOrder } = useGlobalContext()
  const [openAddress, setOpenAddress] = useState(false)
  const addressList = useSelector(state => state.addresses.addressList)
  const [selectAddress, setSelectAddress] = useState(0)
  const cartItemsList = useSelector(state => state.cartItem.cart)
  const navigate = useNavigate()

  const handleCashOnDelivery = async() => {
      try {
        console.log(cartItemsList)  

          const response = await Axios({
            ...SummaryApi.CashOnDeliveryOrder, 
            data : {
              list_items : cartItemsList,
              addressId : addressList[selectAddress]?._id,
              subTotalAmt : totalPrice,
              totalAmt :  totalPrice,
            }
          })

          const { data : responseData } = response

          if(responseData.success){
              toast.success(responseData.message)
              if(fetchCartItem){
                fetchCartItem()
              }
              if(fetchOrder){
                fetchOrder()
              }
              navigate('/success',{
                state : {
                  text : "Order"
                }
              })
          }

      } catch (error) {
        AxiosToastError(error)
      }
  }

  const [formData , setFormData] = useState({})

  return (
    <section className='bg-blue-50'>
      <div className='container mx-auto p-4 flex flex-col lg:flex-row w-full gap-5 justify-between'>
        <div className='w-full'>
          {/***address***/}
          {/* <h3 className='text-lg font-semibold'>Choose your address</h3>
          <div className='bg-white p-2 grid gap-4'>
            {
              addressList.map((address, index) => {
                return (
                  <label htmlFor={"address" + index} className={!address.status && "hidden"}>
                    <div className='border rounded p-3 flex gap-3 hover:bg-blue-50'>
                      <div>
                        <input id={"address" + index} type='radio' value={index} onChange={(e) => setSelectAddress(e.target.value)} name='address' />
                      </div>
                      <div>
                        <p>{address.address_line}</p>
                        <p>{address.city}</p>
                        <p>{address.state}</p>
                        <p>{address.country} - {address.pincode}</p>
                        <p>{address.mobile}</p>
                      </div>
                    </div>
                  </label>
                )
              })
            }
            <div onClick={() => setOpenAddress(true)} className='h-16 bg-blue-50 border-2 border-dashed flex justify-center items-center cursor-pointer'>
              Add address
            </div>
          </div> */}


          <div style={{fontSize:'20px',fontWeight:"600",fontFamily:'serif'}}>
            {/* <h3>Note :-</h3>
            <p>1. We always prefer you to <b>Pay via UPI id</b> , BAR Code may fail sometimes !</p>
            <p>2. After Purchase Your Orders will be in the My Orders Section.</p>
            <p>3. To see your Orders , click on Profile Icon/Account button .</p>
            <p>4. If you face any payment issues, contact +91 89773 00290 .</p> */}

            <div onClick={()=>window.open('https://editing-pack.vercel.app' , '_blank')}  style={{cursor:"pointer"}}>
              <img src={sale} className='w-full h-full hidden lg:block'/>
            </div>
          </div>


        </div> 

        <div className='w-full max-w-md bg-white py-4 px-2'>
          {/**summary**/}
          <h3 className='text-lg font-semibold'>Summary</h3>
          <div className='bg-white p-4'>
            <h3 className='font-semibold'>Bill details</h3>
            <div className='flex gap-4 justify-between ml-1'>
              <p>Items total</p>
              <p className='flex items-center gap-2'><span className='line-through text-neutral-400'>{DisplayPriceInRupees(notDiscountTotalPrice)}</span><span>{DisplayPriceInRupees(totalPrice)}</span></p>
            </div>
            <div className='flex gap-4 justify-between ml-1'>
              <p>Quntity total</p>
              <p className='flex items-center gap-2'>{totalQty} item</p>
            </div>
            {/* <div className='flex gap-4 justify-between ml-1'>
              <p>Delivery Charge</p>
              <p className='flex items-center gap-2'>Free</p>
            </div> */}
            <div className='font-semibold flex items-center justify-between gap-4'>
              <p >Grand total</p>
              <p>{DisplayPriceInRupees(totalPrice)}</p>
            </div>
          </div>
          <div className='w-full flex flex-col gap-4'>



            {
              formData&&formData.email&&formData.phone&&formData.submit?
              <div style={{textAlign:"center"}}>
                {/* <RazorpayPaymentButton  
                    list_items={cartItemsList}
                    addressId={addressList[selectAddress]?._id}
                    subTotalAmt={totalPrice}
                    totalAmt={totalPrice}
                    userDetails={formData}
                />
                <br/> */}
                <br/>
                <CreateCashFreeOrder
                    list_items={cartItemsList}
                    addressId={addressList[selectAddress]?._id}
                    subTotalAmt={totalPrice}
                    totalAmt={totalPrice}
                    userDetails={formData} 
                />
              </div>
              :
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setFormData((prevData) => ({ ...prevData, submit: true }));
                }}
                className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md"
              >
                <label className="block text-gray-700 text-sm font-medium mb-2">Enter your email ID</label>
                <input
                  type="email"
                  placeholder='doe@yahoo.com'
                  required
                  onChange={(e) =>
                    setFormData((prevData) => ({ ...prevData, email: e.target.value }))
                  }
                  style={{border:"1px solid black",padding:"5px",margin:"5px",borderRadius:"5px",width:"300px"}}
                />

                <label className="block text-gray-700 text-sm font-medium mb-2">Enter your mobile number</label>
                <input
                  type="number"
                  required
                  placeholder='9876543210'
                  onChange={(e) =>
                    setFormData((prevData) => ({ ...prevData, phone: e.target.value }))
                  }
                  style={{border:"1px solid black",padding:"5px",margin:"5px",borderRadius:"5px",width:"300px"}}
                />

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setFormData((prevData) => ({ ...prevData, submit: true }));
                  }}
                  className="w-full bg-green-500 text-white mt-5 py-2 rounded hover:bg-green-600 transition duration-200"
                >
                  Submit
                </button>
              </form>

            }

          


            {/* <button className='py-2 px-4 border-2 border-green-600 font-semibold text-green-600 hover:bg-green-600 hover:text-white' onClick={handleCashOnDelivery}>Cash on Delivery</button> */}
          </div>
        </div>
      </div>


      {
        openAddress && (
          <AddAddress close={() => setOpenAddress(false)} />
        )
      }
    </section>
  )
}

export default CheckoutPage
