import React, { useEffect, useState } from 'react'
import { baseURL } from '../common/SummaryApi'
import toast from 'react-hot-toast'

function AllPayments() {

    const [payments , setPayments] = useState([])
    
    async function getData() 
    {
        let data = await fetch(`${baseURL}/api/order/all-orders`)

        console.log(data)
        data = await data.json()
        console.log(data.data)
        setPayments(data.data)
    }

    async function deletePayment(paymentId) 
    {
        let data = await fetch(`${baseURL}/api/order/deletePayment`,{
            method:'post',
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({paymentId:paymentId})
        })
        data = await data.json()

        console.log(data)
        if(data.success)
        {
            toast.success("deleted cnt = ")
        }
        else{
            toast.error('deletion failed !')
        }
    }

    async function grantAccess(orderId) 
    {
        let conformId = prompt("enter Unique ID : ")
        if(conformId == orderId)
        {
            let data = await fetch(`${baseURL}/api/order/grantAccess`,{
                method:'post',
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({orderId:orderId})
            })
            data = await data.json()
    
            console.log(data)
            if(data.success)
            {
                toast.success("Access Granted")
            }
            else{
                toast.error('Action failed !')
            }
        }
        else
        {
            toast.error("Access grant Failed !")
        }
        
    }

    useEffect(()=>{
        getData()
    },[]) 

  return (
    <div className="p-4">
        <h4 className="text-lg font-bold mb-4">All Payments</h4>
        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
            <thead>
                <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
                    <th className="py-3 px-4 border-b border-gray-300">Sr.no</th>
                    <th className="py-3 px-4 border-b border-gray-300">Product Name</th>
                    <th className="py-3 px-4 border-b border-gray-300">Image</th>
                    <th className="py-3 px-4 border-b border-gray-300">Drive Link</th>
                    <th className="py-3 px-4 border-b border-gray-300">User ID</th>
                    <th className="py-3 px-4 border-b border-gray-300">Date & Time</th>
                    <th className="py-3 px-4 border-b border-gray-300">Payment Status</th>
                    <th className="py-3 px-4 border-b border-gray-300">Payment Id</th>
                    <th className="py-3 px-4 border-b border-gray-300">Order Id</th>
                    <th className="py-3 px-4 border-b border-gray-300">Unique Id</th>
                    <th className="py-3 px-4 border-b border-gray-300">Bill Amt</th>
                    <th className="py-3 px-4 border-b border-gray-300">Action</th>
                </tr>
            </thead>
            <tbody>
                {payments.map((payment, idx) => (
                    <tr className="text-gray-700 text-sm border-b border-gray-200 hover:bg-gray-100" key={idx}>
                        <td className=" px-4 text-center">{idx + 1}</td>
                        <td className="  px-4">{payment.product_details.name}</td>
                        <td className="  px-4">
                            <img
                                src={payment.product_details.image[0]}
                                alt="Product"
                                className="w-14 h-14 object-cover"
                            />
                        </td>
                        <td className="  px-4">
                            <a
                                href={payment.product_details.more_details.driveLink}
                                className="text-blue-500 hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                link
                            </a>
                        </td>
                        <td className="  px-4">{payment.userId}</td>
                        <td className="  px-4">{payment.createdAt}</td>
                        <td className=" px-4">{payment.payment_status}</td>
                        <td className="  px-4">{payment.paymentId}</td>
                        <td className=" px-4">{payment.orderId}</td>
                        <td className=" px-4">{payment._id}</td>
                        <td className=" px-4">{payment.totalAmt}</td>
                        <td className=" px-4">
                            {
                                payment.payment_status === 'PENDING' ? (
                                    <div>
                                        <button className="bg-green-500 text-white p-2 m-2 rounded hover:bg-green-700"   
                                        onClick={(e)=>{e.preventDefault();grantAccess(payment._id)}}
                                        >
                                            Allow
                                        </button>

                                        <button className="bg-red-500 text-white px-2 py-2 m-2 rounded hover:bg-red-700"   
                                        onClick={(e)=>{e.preventDefault();deletePayment(payment.paymentId)}}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ) : (
                                    <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
                                        Block Access
                                    </button>
                                )
                            }
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>

  )
}

export default AllPayments