import React, { useEffect, useState } from 'react'
import CardProduct from './CardProduct'
import CardLoading from './CardLoading'
import { baseURL } from '../common/SummaryApi'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'

function BasedOnHistory() {
    const [loading, setLoading] = useState(true)
    const [deals, setDeals] = useState([])
    const [error, setError] = useState(null)

    const user = useSelector(state => state.user)

    async function getData() {
        try {
            setLoading(true)
            setError(null)

            // Check if user is logged in and has an ID
            if (!user?._id) {
                setError('Please login to see personalized recommendations')
                setLoading(false)
                return
            }

            const response = await fetch(`${baseURL}/api/user/recommendations?userId=${user._id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            const data = await response.json()

            console.log(data)
            
            if (data.success) {
                setDeals(data.data)
                if (data.data.length === 0) {
                    setError('No recommendations available yet. Browse more products!')
                }
            } else {
                toast.error(data.message || "Problem loading recommendations")
                setError('Unable to load recommendations')
            }
        } catch (err) {
            console.error('Error fetching recommendations:', err)
            setError('Error loading recommendations')
            toast.error('Failed to load recommendations')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user?._id) {
            getData()
        }
    }, [user?._id]) // Add user._id as dependency

    if (!user?._id) {
        return (
            <div className="text-center py-8 text-gray-600">
                Please login to see personalized recommendations
            </div>
        )
    }

    return (
        <div>
            <div className='mx-auto p-4 gap-4'>
                <h3 className='font-semibold text-lg md:text- text-center uppercase'>
                    Based On Your Recent History
                </h3>
            </div>

            {error && (
                <div className="text-center py-4 text-gray-600">
                    {error}
                </div>
            )}

            <div className='relative flex items-center'>
                <div className='flex gap-4 md:gap-6 lg:gap-8 container mx-auto px-4 overflow-x-scroll scrollbar-none scroll-smooth'>
                    {loading && (
                        Array(5).fill(null).map((_, index) => (
                            <CardLoading key={`loading-card-${index}`} />
                        ))
                    )}

                    {!loading && deals?.length > 0 && (
                        deals.map((p, index) => (
                            <CardProduct
                                data={p.productDetails}
                                key={`product-${p?.productDetails?._id}-${index}`}
                            />
                        ))
                    )}
                </div>
            </div>

            {!loading && deals?.length === 0 && !error && (
                <div className="text-center py-4 text-gray-600">
                    No recommendations available yet
                </div>
            )}
        </div>
    )
}

export default BasedOnHistory