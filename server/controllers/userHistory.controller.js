import userHistoryModel from "../models/userHistory.model.js"

export const addUserHistory = async (req,res)=>{
    try{
        const { userId, productId } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({
                message: "userId and productId are required",
                error: true,
                success: false
            });
        }

        const historyEntry = new userHistoryModel({
            userId,
            productId,
            viewedTime: new Date()
        });

        const savedEntry = await historyEntry.save();

        return res.json({
            message: "History tracked successfully",
            error: false,
            success: true,
            data: savedEntry
        });
    }catch(error){
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export const getUserHistory = async (req,res)=>{
    try{
        const { userId } = req.query;
        
        if (!userId) {
            return res.status(400).json({
                message: "userId is required",
                error: true,
                success: false
            });
        }

        const results = await userHistoryModel.find({ userId })
            .sort({ viewedTime: -1 }); // Sort by newest first

        return res.json({
            message: "User history retrieved successfully",
            error: false,
            success: true,
            data: results
        });
    }catch(error){
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}