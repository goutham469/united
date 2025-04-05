import { Router } from 'express'
import auth from '../middleware/auth.js'
import { addToDeals, createProductController, deleteProductDetails, getDeals, getProductByCategory, getProductByCategoryAndSubCategory, getProductByCategoryMobile, getProductController, getProductDetails, getTrashProducts, recoverProductDetails, removeFromDeals, searchProduct, updateProductDetails } from '../controllers/product.controller.js'
import { admin } from '../middleware/Admin.js'

const productRouter = Router()

productRouter.post("/create",auth,admin,createProductController)
productRouter.post('/get',getProductController)
productRouter.post("/get-product-by-category",getProductByCategory) 
productRouter.post('/get-pruduct-by-category-and-subcategory',getProductByCategoryAndSubCategory)
productRouter.post('/get-product-details',getProductDetails)                    

productRouter.post('/get-product-by-category-mobile' , getProductByCategoryMobile)

//update product
productRouter.put('/update-product-details',auth,admin,updateProductDetails)

//delete product
productRouter.delete('/delete-product',auth,admin,deleteProductDetails)
productRouter.post('/get-trash-products' , getTrashProducts)
productRouter.put('/recover-product'  , recoverProductDetails)

// deals
productRouter.post('/get-deals' , getDeals )
productRouter.post('/add-to-deals' , addToDeals )
productRouter.put('/remove-from-deals' , removeFromDeals )

//search product 
productRouter.post('/search-product',searchProduct)


export default productRouter