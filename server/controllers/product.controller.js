import ProductModel from "../models/product.model.js";
import SubCategoryModel from "../models/subCategory.model.js";
import mongoose from "mongoose";

export const createProductController = async(request,response)=>{
    try {
        const { 
            name ,
            image ,
            category,
            subCategory,
            unit,
            stock,
            price,
            discount,
            description,
            more_details,
        } = request.body 

        if(!name || !image[0] || !category[0] || !subCategory[0] || !unit || !price || !description ){
            return response.status(400).json({
                message : "Enter required fields",
                error : true,
                success : false
            })
        }

        const product = new ProductModel({
            name ,
            image ,
            category,
            subCategory,
            unit,
            stock,
            price,
            discount,
            description,
            more_details,
        })
        const saveProduct = await product.save()

        return response.json({
            message : "Product Created Successfully",
            data : saveProduct,
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

export const getProductController = async(request,response)=>{
    try {
         
        let { page, limit, search } = request.body 

        if(!page){
            page = 1
        }

        if(!limit){
            limit = 10
        }

        let queryString = new RegExp(search , 'i');

        const query = search ? {
            name : {
                $regex : queryString
            }
        } : {}

        const skip = (page - 1) * limit

        const [data,totalCount] = await Promise.all([
            ProductModel.find(query).sort({createdAt : -1 }).skip(skip).limit(limit).populate('category subCategory'),
            ProductModel.countDocuments(query)
        ])

        return response.json({
            message : "Product data",
            error : false,
            success : true,
            totalCount : totalCount,
            totalNoPage : Math.ceil( totalCount / limit),
            data : data
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getProductByCategory = async(request,response)=>{
    try {
        const { id } = request.body 

        if(!id){
            return response.status(400).json({
                message : "provide category id",
                error : true,
                success : false
            })
        }

        const product = await ProductModel.find({ 
            category : { $in : id }
        }).limit(500)

        return response.json({
            message : "category product list 2.0",
            data : product,
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

export const getProductByCategoryMobile = async (request, response) => {
    try {
        const { id } = request.body;

        if (!id) {
            return response.status(400).json({
                message: "Provide category id",
                error: true,
                success: false,
            });
        }

        // Fetch products by category
        let products = await ProductModel.find({
            category: { $in: id },
        }).limit(500);

        // Fetch all subcategories
        let subCategories = await SubCategoryModel.find( );

        subCategories = subCategories.filter((item)=>item.category[0]._id == id)

        // console.log("subCategories : ",subCategories)

        // Prepare the finalData structure
        let finalData = subCategories.map((category) => ({
            id: category._id,
            name: category.name,
            products: [],
            image: category.image,
        }));

        // console.log("finalData : ",finalData)

        // Populate products into the respective subcategory
        products.forEach((product) => {
            const idx = finalData.findIndex((item) => item.id.toString() === product.subCategory[0]?.toString());
            if (idx !== -1) {
                finalData[idx].products.push(product); // Add product to the subcategory
            }
        });

        // console.log("finalData after : ",finalData)

        return response.json({
            message: "Category product list 2.0",
            data: finalData,
            error: false,
            success: true,
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
};





export const getProductByCategoryAndSubCategory  = async(request,response)=>{
    try {
        const { categoryId,subCategoryId,page,limit } = request.body

        if(!categoryId || !subCategoryId){
            return response.status(400).json({
                message : "Provide categoryId and subCategoryId",
                error : true,
                success : false
            })
        }

        if(!page){
            page = 1
        }

        if(!limit){
            limit = 10
        }

        const query = {
            category : { $in :categoryId  },
            subCategory : { $in : subCategoryId }
        }

        const skip = (page - 1) * limit

        const [data,dataCount] = await Promise.all([
            ProductModel.find(query).sort({createdAt : -1 }).skip(skip).limit(limit),
            ProductModel.countDocuments(query)
        ])

        return response.json({
            message : "Product list",
            data : data,
            totalCount : dataCount,
            page : page,
            limit : limit,
            success : true,
            error : false
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getProductDetails = async(request,response)=>{
    try {
        const { productId } = request.body 

        const product = await ProductModel.findOne({ _id : productId })


        return response.json({
            message : "product details",
            data : product,
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

//update product
export const updateProductDetails = async(request,response)=>{
    try {
        const { _id } = request.body 

        if(!_id){
            return response.status(400).json({
                message : "provide product _id",
                error : true,
                success : false
            })
        }

        const updateProduct = await ProductModel.updateOne({ _id : _id },{
            ...request.body
        })

        return response.json({
            message : "updated successfully",
            data : updateProduct,
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

//delete product
export const deleteProductDetails = async (request, response) => {
try 
{
    const { _id } = request.body;

    if (!_id) 
    {
        return response.status(400).json({
            message: "Provide _id",
            error: true,
            success: false
        });
    }

    const target_product = await ProductModel.findById(_id);

    if (!target_product) 
    {
        return response.status(404).json({
            message: "Product not found",
            error: true,
            success: false
        });
    }

    // Create a new TrashProductModel with the data from target_product
    let new_product = new TrashProductModel({ ...target_product.toObject() });

    const saveProduct = await new_product.save();

    await ProductModel.deleteOne({ _id: _id });

    return response.json({
        message: "Product deleted and moved to trash successfully",
        data: saveProduct,
        error: false,
        success: true
    });

} 
catch (error) 
{
    return response.status(500).json({
        message: error.message || error,
        error: true,
        success: false
    });
}
};

export const recoverProductDetails = async (request, response) => {
    try 
    {
        const { _id } = request.body;
    
        if (!_id) 
        {
            return response.status(400).json({
                message: "Provide _id",
                error: true,
                success: false
            });
        }
    
        const target_product = await TrashProductModel.findById(_id);
    
        if (!target_product) 
        {
            return response.status(404).json({
                message: "Product not found",
                error: true,
                success: false
            });
        }
    
        // Create a new TrashProductModel with the data from target_product
        let new_product = new ProductModel({ ...target_product.toObject() });
    
        const saveProduct = await new_product.save();
    
        await TrashProductModel.deleteOne({ _id: _id });
    
        return response.json({
            message: "Product recovered and moved to production successfully",
            data: saveProduct,
            error: false,
            success: true
        });
    
    } 
    catch (error) 
    {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};
    

export const getTrashProducts = async(request , response ) => {
    try {
         
        let { page, limit, search } = request.body 

        if(!page){
            page = 1
        }

        if(!limit){
            limit = 10
        }

        let queryString = new RegExp(search , 'i');

        const query = search ? {
            name : {
                $regex : queryString
            }
        } : {}

        const skip = (page - 1) * limit

        const [data,totalCount] = await Promise.all([
            TrashProductModel.find(query).sort({createdAt : -1 }).skip(skip).limit(limit).populate('category subCategory'),
            TrashProductModel.countDocuments(query)
        ])

        return response.json({
            message : "Trash Product data",
            error : false,
            success : true,
            totalCount : totalCount,
            totalNoPage : Math.ceil( totalCount / limit),
            data : data
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}


// deals section
export const addToDeals = async (request, response) => {
    try 
    {
        const { _id } = request.body;
    
        if (!_id) 
        {
            return response.status(400).json({
                message: "Provide _id",
                error: true,
                success: false
            });
        }
    
        const target_product = await ProductModel.findById(_id);
    
        if (!target_product) 
        {
            return response.status(404).json({
                message: "Product not found",
                error: true,
                success: false
            });
        }
    
        // Create a new TrashProductModel with the data from target_product
        let new_product = new DealsSchemaModel({ ...target_product.toObject() });
    
        const saveProduct = await new_product.save();
    
    
        return response.json({
            message: "Product added to deals",
            data: saveProduct,
            error: false,
            success: true
        });
    
    } 
    catch (error) 
    {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const removeFromDeals = async (request, response) => {
    try 
    {
        const { _id } = request.body;
    
        if (!_id) 
        {
            return response.status(400).json({
                message: "Provide _id",
                error: true,
                success: false
            });
        }
    
        const target_product = await DealsSchemaModel.deleteOne({ _id: _id });
    
        if (!target_product) 
        {
            return response.status(404).json({
                message: "Product not found",
                error: true,
                success: false
            });
        }
        
    
        return response.json({
            message: "Product removed from deals",
            data: target_product,
            error: false,
            success: true
        });
    
    } 
    catch (error) 
    {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const getDeals = async (request, response) => {
    try 
    {
        let { page, limit, search } = request.body 

        if(!page){
            page = 1
        }

        if(!limit){
            limit = 10
        }

        let queryString = new RegExp(search , 'i');

        const query = search ? {
            name : {
                $regex : queryString
            }
        } : {}

        const skip = (page - 1) * limit

        const [data,totalCount] = await Promise.all([
            DealsSchemaModel.find(query).sort({createdAt : -1 }).skip(skip).limit(limit).populate('category subCategory'),
            DealsSchemaModel.countDocuments(query)
        ])
    
    
        return response.json({
            message: "deals",
            data: data,
            error: false,
            success: true,
            totalCount : totalCount,
            totalNoPage : Math.ceil( totalCount / limit)
        });
    
    } 
    catch (error) 
    {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

    

//search product
export const searchProduct = async(request,response)=>{
    try {
        let { search, page , limit } = request.body 

        if(!page){
            page = 1
        }
        if(!limit){
            limit  = 10
        }

        let queryString = new RegExp(search , 'i');

        const query = search ? {
            name : { $regex : queryString }
        } : {}

        const skip = ( page - 1) * limit

        const [data,dataCount] = await Promise.all([
            ProductModel.find(query).sort({ createdAt  : -1 }).skip(skip).limit(limit).populate('category subCategory'),
            ProductModel.countDocuments(query)
        ])

        return response.json({
            message : "Product data",
            error : false,
            success : true,
            data : data,
            totalCount :dataCount,
            totalPage : Math.ceil(dataCount/limit),
            page : page,
            limit : limit 
        })


    } catch (error) {
        console.log(error)
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}












const trashProductSchema = new mongoose.Schema({
    name : {
        type : String,
    },
    image : {
        type : Array,
        default : []
    },
    category : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'category'
        }
    ],
    subCategory : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'subCategory'
        }
    ],
    unit : {
        type : String,
        default : ""
    },
    stock : {
        type : Number,
        default : null
    },
    price : {
        type : Number,
        defualt : null
    },
    discount : {
        type : Number,
        default : null
    },
    description : {
        type : String,
        default : ""
    },
    more_details : {
        type : Object,
        default : {}
    },
    publish : {
        type : Boolean,
        default : true
    }
},{
    timestamps : true
})

//create a text index
trashProductSchema.index({
    name  : "text",
    description : 'text'
},{
    name : 10,
    description : 5
})
const TrashProductModel = mongoose.model('trashproduct',trashProductSchema)
export default TrashProductModel


// deals model

const DealsSchema = new mongoose.Schema({
    name : {
        type : String,
    },
    image : {
        type : Array,
        default : []
    },
    category : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'category'
        }
    ],
    subCategory : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'subCategory'
        }
    ],
    unit : {
        type : String,
        default : ""
    },
    stock : {
        type : Number,
        default : null
    },
    price : {
        type : Number,
        defualt : null
    },
    discount : {
        type : Number,
        default : null
    },
    description : {
        type : String,
        default : ""
    },
    more_details : {
        type : Object,
        default : {}
    },
    publish : {
        type : Boolean,
        default : true
    }
},{
    timestamps : true
})

//create a text index
DealsSchema.index({
    name  : "text",
    description : 'text'
},{
    name : 10,
    description : 5
})


export const DealsSchemaModel = mongoose.model('deals',DealsSchema)


