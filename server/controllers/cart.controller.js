import CartProductModel from "../models/cartproduct.model.js";
import UserModel from "../models/user.model.js";
import wishListModelSchema from "../models/wishList.model.js";

export const addToCartItemController = async(request,response)=>{
    try {
        const  userId = request.userId
        const { productId } = request.body
        
        if(!productId){
            return response.status(402).json({
                message : "Provide productId",
                error : true,
                success : false
            })
        }

        const checkItemCart = await CartProductModel.findOne({
            userId : userId,
            productId : productId
        })

        if(checkItemCart){
            return response.status(400).json({
                message : "Item already in cart"
            })
        }

        const cartItem = new CartProductModel({
            quantity : 1,
            userId : userId,
            productId : productId
        })
        const save = await cartItem.save()

        const updateCartUser = await UserModel.updateOne({ _id : userId},{
            $push : { 
                shopping_cart : productId
            }
        })

        return response.json({
            data : save,
            message : "Item add successfully",
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

export const getCartItemController = async(request,response)=>{
    try {
        const userId = request.userId

        const cartItem =  await CartProductModel.find({
            userId : userId
        }).populate('productId')

        return response.json({
            data : cartItem,
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

export const updateCartItemQtyController = async(request,response)=>{
    try {
        const userId = request.userId 
        const { _id,qty } = request.body

        if(!_id ||  !qty){
            return response.status(400).json({
                message : "provide _id, qty"
            })
        }

        const updateCartitem = await CartProductModel.updateOne({
            _id : _id,
            userId : userId
        },{
            quantity : qty
        })

        return response.json({
            message : "Update cart",
            success : true,
            error : false, 
            data : updateCartitem
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const deleteCartItemQtyController = async(request,response)=>{
    try {
      const userId = request.userId // middleware
      const { _id } = request.body 
      
      if(!_id){
        return response.status(400).json({
            message : "Provide _id",
            error : true,
            success : false
        })
      }

      const deleteCartItem  = await CartProductModel.deleteOne({_id : _id, userId : userId })

      return response.json({
        message : "Item remove",
        error : false,
        success : true,
        data : deleteCartItem
      })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}


// wishlist controllers

export const getWishListProducts = async (req, res) => {
    try {
        const userId = req.body.userId;
        
        // Add proper population with specific fields
        const wishlistItems = await wishListModelSchema.find({ userId })
            .populate({
                path: 'productId',
                select: 'name image price discount description stock more_details', // Only select fields we need
                match: { publish: true } // Only get published products
            });

        // Filter out any null productId items (in case product was deleted)
        const validWishlistItems = wishlistItems.filter(item => item.productId);

        return res.json({
            message: "Wishlist items retrieved successfully",
            error: false,
            success: true,
            data: validWishlistItems
        });
    } catch (error) {
        console.error('Wishlist fetch error:', error);
        return res.status(500).json({
            message: error.message || "Error fetching wishlist items",
            error: true,
            success: false
        });
    }
}

export const addToWishListProducts = async (req, res) => {
    try { 
        const { productId , userId } = req.body;

        if (!productId) { 
            return res.status(400).json({
                message: "Product ID is required",
                error: true,
                success: false
            });
        }

        // Check if product already exists in wishlist
        const existingItem = await wishListModelSchema.findOne({ userId, productId });
        if (existingItem) {
            // If item exists, remove it (toggle behavior)
            await wishListModelSchema.deleteOne({ userId, productId });
            return res.json({
                message: "Product removed from wishlist",
                error: false,
                success: true,
                isAdded: false
            });
        }

        // If item doesn't exist, add it
        const wishlistItem = new wishListModelSchema({
            userId,
            productId
        });

        const savedItem = await wishlistItem.save();

        return res.json({
            message: "Product added to wishlist successfully",
            error: false,
            success: true,
            data: savedItem,
            isAdded: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export const getCombinedAnalytics = async (req, res) => {
    try {
        // Get all wishlist items
        const wishlistItems = await wishListModelSchema.find()
            .populate('productId', 'name price')
            .lean();

        // Get all cart items for conversion analysis
        const cartItems = await CartProductModel.find().lean();

        // Calculate basic metrics
        const totalWishlistProducts = new Set(wishlistItems.map(item => item.productId?._id.toString())).size;
        const activeUsers = new Set(wishlistItems.map(item => item.userId.toString())).size;
        const totalWishlistItems = wishlistItems.length;

        // Calculate user engagement levels
        const userWishlistCounts = {};
        wishlistItems.forEach(item => {
            const userId = item.userId.toString();
            userWishlistCounts[userId] = (userWishlistCounts[userId] || 0) + 1;
        });

        // Define engagement thresholds
        const highEngagementThreshold = 5;
        const mediumEngagementThreshold = 2;

        const userEngagement = {
            high: 0,
            medium: 0,
            low: 0
        };

        // Calculate user engagement distribution
        Object.values(userWishlistCounts).forEach(count => {
            if (count >= highEngagementThreshold) userEngagement.high++;
            else if (count >= mediumEngagementThreshold) userEngagement.medium++;
            else userEngagement.low++;
        });

        // Calculate user activity over time (last 7 days)
        const userActivity = [];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const startOfDay = new Date(date.setHours(0, 0, 0, 0));
            const endOfDay = new Date(date.setHours(23, 59, 59, 999));

            const activeUsersCount = new Set(
                wishlistItems
                    .filter(item => 
                        new Date(item.updatedAt) >= startOfDay && 
                        new Date(item.updatedAt) <= endOfDay
                    )
                    .map(item => item.userId.toString())
            ).size;

            userActivity.push({
                date: startOfDay.toISOString().split('T')[0],
                count: activeUsersCount
            });
        }

        // Calculate conversion metrics
        const usersWithWishlist = new Set(wishlistItems.map(item => item.userId.toString()));
        const usersWithCart = new Set(cartItems.map(item => item.userId.toString()));
        const usersConvertedToCart = new Set(
            [...usersWithWishlist].filter(userId => usersWithCart.has(userId))
        );
        const conversionRate = (usersConvertedToCart.size / usersWithWishlist.size) * 100;

        // Prepare detailed user activity data
        const userDetails = Object.entries(userWishlistCounts).map(([userId, count]) => {
            const lastActive = wishlistItems
                .filter(item => item.userId.toString() === userId)
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0]?.updatedAt;

            return {
                userId,
                wishlistCount: count,
                activity: count >= highEngagementThreshold ? 'high' : 
                          count >= mediumEngagementThreshold ? 'medium' : 'low',
                lastActive
            };
        });

        return res.json({
            success: true,
            error: false,
            data: {
                totalWishlistProducts,
                activeUsers,
                totalWishlistItems,
                conversionRate,
                avgItemsPerUser: totalWishlistItems / activeUsers,
                userEngagement,
                userActivity,
                userDetails: userDetails.sort((a, b) => b.wishlistCount - a.wishlistCount)
            }
        });

    } catch (error) {
        console.error('Combined analytics error:', error);
        return res.status(500).json({
            message: error.message || "Error fetching combined analytics",
            error: true,
            success: false
        });
    }
};

// wishListModelSchema.index({ userId: 1, updatedAt: 1 });
// wishListModelSchema.index({ productId: 1 });