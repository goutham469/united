import { Router } from "express";
import auth from "../middleware/auth.js";
import { 
    addToCartItemController, 
    deleteCartItemQtyController, 
    getCartItemController, 
    updateCartItemQtyController,
    getWishListProducts,
    addToWishListProducts
} from "../controllers/cart.controller.js";

const cartRouter = Router()

// Cart routes
cartRouter.post('/create', auth, addToCartItemController)
cartRouter.get("/get", auth, getCartItemController)
cartRouter.put('/update-qty', auth, updateCartItemQtyController)
cartRouter.delete('/delete-cart-item', auth, deleteCartItemQtyController)

// Wishlist routes
cartRouter.get("/get-wishlist", getWishListProducts)
cartRouter.post("/add-to-wish-list", addToWishListProducts)

export default cartRouter;