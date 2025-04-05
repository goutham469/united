import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { baseURL } from '../common/SummaryApi';
import CardProduct from '../components/CardProduct';
import toast from 'react-hot-toast';
import { FaHeart } from 'react-icons/fa6';

const WishlistPage = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const user = useSelector((state) => state.user);

    const fetchWishlistItems = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!user?._id) {
                setError('Please login to view your wishlist');
                return;
            }

            const response = await fetch(`${baseURL}/api/cart/get-wishlist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ userId: user._id })
            });

            const result = await response.json();

            if (result.success) {
                // Filter out any invalid products
                const validItems = result.data.filter(item => item.productId && item.productId._id);
                console.log(validItems);
                
                
                setWishlistItems(validItems);
            } else {
                setError(result.message || 'Failed to fetch wishlist items');
                toast.error(result.message || 'Failed to fetch wishlist items');
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            setError('Error loading wishlist');
            toast.error('Error loading wishlist');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlistItems();
    }, [user?._id]);

    // Loading state
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-2 mb-6">
                    <FaHeart className="text-red-500" size={24} />
                    <h1 className="text-2xl font-semibold">My Wishlist</h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="bg-gray-200 h-48 rounded-lg"></div>
                            <div className="mt-4 bg-gray-200 h-4 rounded w-3/4"></div>
                            <div className="mt-2 bg-gray-200 h-4 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <FaHeart className="text-red-500 mx-auto mb-4" size={32} />
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    // Empty state
    if (wishlistItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-2 mb-6">
                    <FaHeart className="text-red-500" size={24} />
                    <h1 className="text-2xl font-semibold">My Wishlist</h1>
                </div>
                <div className="text-center py-12">
                    <FaHeart className="text-gray-300 mx-auto mb-4" size={48} />
                    <p className="text-gray-500 text-lg">Your wishlist is empty</p>
                    <p className="text-gray-400 mt-2">
                        Browse products and add items to your wishlist
                    </p>
                </div>
            </div>
        );
    }

    // Success state with items
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-2 mb-6">
                <FaHeart className="text-red-500" size={24} />
                <h1 className="text-2xl font-semibold">My Wishlist</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {wishlistItems.map((item) => (
                    item.productId && (
                        <CardProduct
                            key={item.productId._id}
                            data={item.productId}
                        />
                    )
                ))}
            </div>
        </div>
    );
};

export default WishlistPage; 