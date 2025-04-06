import React, { useEffect, useState } from 'react'
import { baseURL } from '../App'
import toast from 'react-hot-toast';
import { IoSearchOutline } from 'react-icons/io5';

function Deals() {
    const [products , setProducts] = useState([])
    const [page, setPage] = useState(0);
    const [search , setSearch] = useState('')
    const [totalPages , setTotalPages] = useState()
    const [totalCount , setTotalCount] = useState()
    const [notificationPermission, setNotificationPermission] = useState('default');
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [emailStatus, setEmailStatus] = useState(null);

    // Function to request notification permission
    const requestNotificationPermission = async () => {
        try {
            if (!("Notification" in window)) {
                toast.error("This browser does not support notifications");
                return;
            }

            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
            
            if (permission === 'granted') {
                toast.success("Notification permission granted!");
            } else if (permission === 'denied') {
                toast.error("Notification permission denied");
            }
        } catch (error) {
            console.error("Error requesting notification permission:", error);
            toast.error("Failed to setup notifications");
        }
    };

    // Function to show notification
    const showNotification = (title, body) => {
        try {
            if (!("Notification" in window)) {
                toast.error("This browser does not support notifications");
                return;
            }

            if (Notification.permission === "granted") {
                const options = {
                    body: body,
                    icon: "/your-logo.png", // Add your app's logo path here
                    badge: "/your-badge.png", // Add your badge icon path here
                    vibrate: [200, 100, 200],
                    tag: "deals-notification",
                    renotify: true
                };

                new Notification(title, options);
            }
        } catch (error) {
            console.error("Error showing notification:", error);
        }
    };

    async function getData(){
        try{
            let data = await fetch(`${baseURL}/api/product/get-deals` , {
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({
                    page:page,
                    search:search
                })
            })
            data = await data.json()

            setProducts(data.data)
            setTotalPages(data.totalNoPage);
            setTotalCount(data.totalCount)
        }catch(err){
            toast.error("failed to load recycle bin")
        }
    }

    useEffect(()=>{
        getData()
        // Request notification permission when component mounts
        requestNotificationPermission();
    }, [ ] )

    const handleSendEmailNotification = async () => {
        try {
            if (!products || products.length === 0) {
                toast.error("No deals available to send");
                return;
            }

            setIsSendingEmail(true);
            setEmailStatus(null);

            const response = await fetch(`${baseURL}/api/notification/send-deals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    deals: products.map(product => ({
                        _id: product._id,
                        name: product.name,
                        price: product.price,
                        description: product.description,
                        image: product.image
                    }))
                })
            });

            const result = await response.json();

            if (result.success) {
                toast.success(result.message);
                setEmailStatus({
                    type: 'success',
                    message: result.message
                });
            } else {
                throw new Error(result.message || 'Failed to send email notification');
            }
        } catch (error) {
            console.error('Error sending email notification:', error);
            toast.error(error.message || 'Failed to send email notification');
            setEmailStatus({
                type: 'error',
                message: error.message || 'Failed to send email notification'
            });
        } finally {
            setIsSendingEmail(false);
        }
    };

    return (
        <div className="p-4">
            <div className="p-2 bg-white shadow-md flex items-center justify-between gap-4 mb-4">
                <h2 className="font-semibold">Deals ({ totalCount })</h2>

                <div className="flex items-center gap-4">
                    <div className="bg-blue-50 px-4 py-2 rounded flex items-center gap-3">
                        <IoSearchOutline size={25} />
                        <input
                            type="text"
                            placeholder="Search product here..."
                            className="h-full w-full bg-transparent outline-none"
                            value={search}
                            onChange={ e => setSearch(e.target.value) }
                        />
                    </div>

                    <button
                        onClick={handleSendEmailNotification}
                        disabled={isSendingEmail || !products.length}
                        className={`px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 ${
                            isSendingEmail || !products.length
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {isSendingEmail ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Sending...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span>Send Email to All Users</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {emailStatus && (
                <div className={`mb-4 p-4 rounded-lg ${
                    emailStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {emailStatus.message}
                </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {products.map(product => (
                        <Card 
                            key={product._id} 
                            product={product} 
                            showNotification={showNotification}
                        />
                    ))}
                </div>

                <div className="flex justify-between my-4">
                    <button 
                        onClick={() => setPage(page === 0 ? 0 : page - 1)} 
                        className="border px-4 py-1 hover:bg-gray-200 rounded"
                        disabled={page === 0}
                    >
                        Previous
                    </button>

                    <span className="font-medium">Page {page + 1} of {totalPages}</span>

                    <button 
                        onClick={() => setPage(page + 1)} 
                        className="border px-4 py-1 hover:bg-gray-200 rounded"
                        disabled={page >= totalPages - 1}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Deals;

function Card({ product, showNotification }) {
    async function removeDeal() {
        try {
            let data = await fetch(`${baseURL}/api/product/remove-from-deals`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ _id: product._id })
            })
            data = await data.json()
            if (data.success) {
                toast.success(data.message)
                // Show notification when deal is removed
                showNotification(
                    "Deal Updated",
                    `${product.name} has been removed from deals`
                );
            } else {
                toast.error(data.message)
            }
        } catch (err) {
            toast.error(err.message)
        }
    }

    return (
        <div className='w-46 p-2 bg-white rounded'>
            <div>
                <img
                    src={product?.image[0]}
                    alt={product?.name}
                    className='w-full h-full object-scale-down'
                />
            </div>
            <p className='text-ellipsis line-clamp-2 font-medium'>{product?.name}</p>
            <p className='text-slate-400'>{product?.unit}</p>
            <div className='grid grid-cols-2 gap-3 py-2'>
                <button 
                    onClick={removeDeal} 
                    className='border px-1 py-1 text-sm border-green-600 bg-green-100 text-green-800 hover:bg-green-200 rounded'
                >
                    Remove Deal
                </button>
            </div>
        </div>
    )
}