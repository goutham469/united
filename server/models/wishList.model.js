import mongoose from "mongoose";

const wishListSchema = new mongoose.Schema({
    productId : {
        type : mongoose.Schema.ObjectId,
        ref : 'product'
    },
    userId : {
        type : mongoose.Schema.ObjectId,
        ref : "User"
    }
},{
    timestamps : true
})

const wishListModelSchema = mongoose.model('wishList',wishListSchema)

export default wishListModelSchema;