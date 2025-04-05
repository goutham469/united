import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import connectDB from './config/connectDB.js';
import serverless from 'serverless-http';

import userRouter from './route/user.route.js';
import categoryRouter from './route/category.route.js';
import uploadRouter from './route/upload.router.js';
import subCategoryRouter from './route/subCategory.route.js';
import productRouter from './route/product.route.js';
import cartRouter from './route/cart.route.js';
import addressRouter from './route/address.route.js';
import orderRouter from './route/order.route.js';
import surveyRouter from './route/survey.route.js';
import { product_template } from './templates/product.js';
import sendEmail from './config/sendEmail.js';

dotenv.config();

const app = express();
let mongoConnection = false;

app.use(cors({ origin: [process.env.FRONTEND_URL , 'http://localhost:5173' , 'https://editwithsanjay.in' , 'https://www.editwithsanjay.in' ] , credentials: true }))
app.use(express.json());
app.use(cookieParser());


// Middleware to ensure MongoDB is connected
app.use(async (req, res, next) => {
    if (!mongoConnection) {
        try {
            await connectDB();
            mongoConnection = true;
            next();
        } catch (err) {
            return res.status(500).json({ message: "MongoDB not connected yet" });
        }
    } else {
        next();
    }
});

// Routes
app.use('/api/user', userRouter);
app.use('/api/category', categoryRouter);
app.use('/api/file', uploadRouter);
app.use('/api/subcategory', subCategoryRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);
app.use('/api/survey', surveyRouter);

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

app.get('/', (req, res) => {
    if (mongoConnection) {
        res.json({ message: 'Server is running!' ,mongoConnection:true});
    } else {
        res.status(500).json({ message: 'MongoDB not connected yet',mongoConnection:false });
    }
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});

// Export the handler for serverless
export const handler = serverless(app);
