import React, { useEffect, useState } from 'react'
import { useGlobalContext } from '../provider/GlobalProvider'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import Loading from './Loading'
import { useSelector } from 'react-redux'
import { FaMinus, FaPlus } from "react-icons/fa6";
import { BsCart4, BsCartXFill } from 'react-icons/bs'
import BottomForm from './BottomForm'

const AddToCartButton = ({ data }) => {
    
    const { fetchCartItem, updateCartItem, deleteCartItem } = useGlobalContext()
    const [loading, setLoading] = useState(false)
    const cartItem = useSelector(state => state.cartItem.cart)
    const [isAvailableCart, setIsAvailableCart] = useState(false)
    const [qty, setQty] = useState(0)
    const [cartItemDetails,setCartItemsDetails] = useState()

    const [productDetails , setProductDetails] = useState({})
    const [showForm, setShowForm] = useState(false)  // Add state to control form visibility

    const handleADDTocart = async (e) => {
        e.preventDefault()
        e.stopPropagation()

        try {
            setLoading(true)

            console.log(data)
            if(data.price == 0)
            {
                toast.success("FREE product")
            }
            else
            {
                const response = await Axios({
                    ...SummaryApi.addTocart,
                    data: {
                        productId: data?._id
                    }
                })
    
                console.log(data)
    
                const { data: responseData } = response
    
                if (responseData.success) {
                    toast.success(responseData.message)
                    if (fetchCartItem) {
                        fetchCartItem()
                    }
                }

            }

        } catch (error) {
            AxiosToastError(error)
        } finally {
            setLoading(false)
        }

    }

    //checking this item in cart or not
    useEffect(() => {
        const checkingitem = cartItem.some(item => item.productId._id === data._id)
        setIsAvailableCart(checkingitem)

        const product = cartItem.find(item => item.productId._id === data._id)
        setQty(product?.quantity)
        setCartItemsDetails(product)
    }, [data, cartItem])


    const increaseQty = async(e) => {
        e.preventDefault()
        e.stopPropagation()
    
       const response = await  updateCartItem(cartItemDetails?._id,qty+1)
        
       if(response.success){
        toast.success("Item added")
       }
    }

    const decreaseQty = async(e) => {
        e.preventDefault()
        e.stopPropagation()
        if(qty === 1){
            deleteCartItem(cartItemDetails?._id)
        }else{
            const response = await updateCartItem(cartItemDetails?._id,qty-1)

            if(response.success){
                toast.success("Item removed")
            }
        }
    }
    
    const decreaseQty2 = async(e) => {
        e.preventDefault()
        e.stopPropagation() 
        let data = cartItemDetails;
        setProductDetails(cartItemDetails)
        deleteCartItem(cartItemDetails?._id)
        console.log(data)

        // Open the BottomForm when the item is removed from the cart
        setShowForm(true)   
    }

    return (
        <div className='w-full max-w-[150px]'>
            {
                isAvailableCart ? (
                    <div className='flex w-full h-full'>
                        {
                            qty % 2 === 0 ?
                                <button onClick={increaseQty} className='bg-green-600 hover:bg-green-700 text-white flex-1 w-full p-1 rounded flex items-center justify-center'>
                                    <BsCart4 /> 
                                    Add
                                </button>
                                :
                                <button onClick={decreaseQty2} className='bg-amber-600 hover:bg-amber-500 text-white px-2 lg:px-4 py-1 rounded'>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <BsCartXFill size={22}/> 
                                    </div>
                                </button>
                        }
                    </div>
                ) : (
                    <button onClick={handleADDTocart} className='bg-green-600 hover:bg-green-700 text-white px-2 lg:px-4 py-1 rounded'>
                        {loading ? <Loading /> : <div style={{ display: "flex", justifyContent: "space-between" }} >
                            <BsCart4 size={22}/>
                            <label style={{ marginLeft: "4px" }}> Add </label>
                        </div>}
                    </button>
                )
            }

            {/* Display BottomForm if showForm is true */}
            {showForm && <div> 
                <BottomForm productId={productDetails?.productId?._id} userId={productDetails?.userId} />
            </div>  }
        </div>
    )
}

export default AddToCartButton
