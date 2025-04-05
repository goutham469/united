import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaShareAlt } from 'react-icons/fa';
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';
import { valideURLConvert } from '../utils/valideURLConvert';
import { pricewithDiscount } from '../utils/PriceWithDiscount';
import AddToCartButton from './AddToCartButton';
import toast from 'react-hot-toast';
import { FaHeart, FaShare } from 'react-icons/fa6';
import { useSelector } from 'react-redux';
import axios from 'axios';

const CardProduct = ({ data }) => {
  const url = `/product/${valideURLConvert(data.name)}-${data._id}`;
  const [loading, setLoading] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const user = useSelector((state) => state.user);

  useEffect(() => {
    if (user?._id) {
      fetchWishlistStatus();
    }
  }, [user._id, data._id]);

  const fetchWishlistStatus = async () => {
    try {
      const response = await axios.get('/api/cart/get-wishlist', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const isProductInWishlist = response.data.data.some(
        item => item.productId._id === data._id
      );
      setIsInWishlist(isProductInWishlist);
    } catch (error) {
      console.error('Error fetching wishlist status:', error);
    }
  };

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?._id) {
      toast.error('Please login to manage wishlist');
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.post('/api/cart/add-to-wish-list', {
        productId: data._id
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setIsInWishlist(response.data.isAdded);
        toast.success(response.data.message);
      }

    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating wishlist');
    } finally {
      setLoading(false);
    }
  };

  const shareProduct = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const productUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(productUrl).then(() => {
      toast.success("link copied to clipboard");
    }).catch(err => {
      console.error('Error copying text to clipboard: ', err);
    });
  };

  console.log({ productId:data._id , userId:user._id  })
  // implement get route to get wishlist data
  // implement post route to update wishlist functions
  // if the product is in winshlist change the heart color to different
  

  return (
    <Link to={url} className="border py-2 lg:p-2 grid gap-1 lg:gap-3 min-w-36 lg:min-w-52 rounded cursor-pointer bg-white">
      <div className="min-h-20 w-full max-h-24 lg:max-h-32 rounded overflow-hidden">
        <img src={data.image[0]} className="w-full h-full object-scale-down lg:scale-125" alt={data.name} />
      </div>

      <div className="flex justify-between items-center gap-1">
        {Boolean(data.discount) && (
          <p className="text-green-600 bg-green-100 px-2 w-fit text-xs rounded-full">
            {data.discount}% Discount
          </p>
        )}
        <FaShare 
          color='#1ba64f' 
          size={20} 
          onClick={(e) => shareProduct(e)} 
          className="cursor-pointer" 
        />
        <FaHeart
          color={isInWishlist ? '#ff4d4d' : '#1ba64f'}
          size={20}
          onClick={(e) => toggleWishlist(e)}
          className={`cursor-pointer transition-colors duration-300 ${
            loading ? 'opacity-50' : ''
          } hover:scale-110`}
        />
      </div>

      <div className="px-2 lg:px-0 font-medium text-ellipsis text-sm lg:text-base line-clamp-2">
        {data.name}
      </div>

      <div className="px-2 lg:px-0 flex items-center justify-between gap-1 lg:gap-3 text-sm lg:text-base">
        <div className="flex items-center gap-1">
          <div className="font-semibold">{DisplayPriceInRupees(pricewithDiscount(data.price, data.discount))}</div>
        </div>

  

        {data.price == 0 ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              window.open(data.more_details.driveLink);
            }}
            className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded shadow-sm transition duration-200 ease-in-out"
          >
            Download Now
          </button>
        ) : (
          <div>
            {data.stock == 0 ? (
              <p className="text-red-500 text-sm text-center">Out of stock</p>
            ) : (
              <AddToCartButton data={data} />
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default CardProduct;