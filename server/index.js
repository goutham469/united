import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import cookieParser from 'cookie-parser'
// import morgan from 'morgan'
// import helmet from 'helmet'
import connectDB from './config/connectDB.js'
import userRouter from './route/user.route.js'
import categoryRouter from './route/category.route.js'
import uploadRouter from './route/upload.router.js'
import subCategoryRouter from './route/subCategory.route.js'
import productRouter from './route/product.route.js'
import cartRouter from './route/cart.route.js'
import addressRouter from './route/address.route.js'
import orderRouter from './route/order.route.js'
import surveyRouter from './route/survey.route.js'
import sendEmail from './config/sendEmail.js'
import { product_template } from './templates/product.js'

// const serverless = require('serverless-http');

const app = express()

// app.use(cors({
//     credentials : true,
//     origin : process.env.FRONTEND_URL
// }))

app.use(cors({ origin: [process.env.FRONTEND_URL , 'http://localhost:5173'  ] , credentials: true }))

app.use(express.json())
app.use(cookieParser())
// app.use(morgan())
// app.use(helmet({
//     crossOriginResourcePolicy : false
// }))

const PORT = process.env.PORT || 8080

app.get("/",(request,response)=>{
    ///server to client
    // console.log("new request came from ",request.ip)
    response.json({
        message : "Server is running " + PORT
    })
})

app.use('/api/user',userRouter)
app.use("/api/category",categoryRouter)
app.use("/api/file",uploadRouter)
app.use("/api/subcategory",subCategoryRouter)
app.use("/api/product",productRouter)
app.use("/api/cart",cartRouter)
app.use("/api/address",addressRouter)
app.use('/api/order',orderRouter)
app.use('/api/survey', surveyRouter)

app.post('/api/services/send-product' ,async  (req , res) => {

    const { id } = req.body;
    
    const { toEmail , url } = req.body;
    console.log(req.body);
    const template = product_template( url )
    // console.log(template);
    console.log(   process.env.SENDER_EMAIL , process.env.EMAIL_PASS  )

    sendEmail( toEmail , "thank you for purchasing" , template )
    res.json({
        success:true,
        message:"mail sent"
    })
})

connectDB().then(()=>{
    app.listen(PORT,()=>{
        console.log("Server is running",PORT)

        // console.log("version : 1.1")
        // console.log("key changes : ")
        // console.log("1.replace CORS site with environment variables.")
        // console.log("This service will be available for only : ",process.env.FRONTEND_URL)

        // console.log("\nversion : 1.2")
        // console.log("key changes : ")
        // console.log("1.added routes for Order : 1)get all orders,2)delete order for PENDING orders !")
        // console.log("2.added route for all-users")

        // console.log("\nversion : 1.3")
        // console.log("key changes : ")
        // console.log("1.multiple payments with RZP enabled with removing unique constraint for Orders schema !")
        // console.log("2.Orders Schema modified")

        // console.log("\nversion : 1.4")
        // console.log("key changes : ")
        // console.log("1.Grant access route added !")

        // console.log("\nversion : 1.5")
        // console.log("key changes : ")
        // console.log("1.Mobile category wise data added ")

        // console.log("\nversion : 1.6")
        // console.log("key changes : ")
        // console.log("1.Login route for Google OAuth added ")

        // console.log("\nversion : 1.7")
        // console.log("key changes : ")
        // console.log("1.metrics and form pop up added ")
        

        console.log("ok")

        
    })
})

// module.exports.handler = serverless(app);