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

        const existingEntry = await userHistoryModel.findOne({
            userId,
            productId,
            viewedTime: {
                $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
        });

        if (existingEntry) {
            existingEntry.viewedTime = new Date();
            await existingEntry.save();

            return res.json({
                message: "History updated successfully",
                error: false,
                success: true,
                data: existingEntry
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
        console.error('History tracking error:', error);
        return res.status(500).json({
            message: error.message || "Error tracking history",
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

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const results = await userHistoryModel.find({ userId })
            .sort({ viewedTime: -1 })
            .skip(skip)
            .limit(limit)
            .populate('productId', 'name image price');

        const total = await userHistoryModel.countDocuments({ userId });

        return res.json({
            message: "User history retrieved successfully",
            error: false,
            success: true,
            data: {
                history: results,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: limit
                }
            }
        });
    }catch(error){
        console.error('Get history error:', error);
        return res.status(500).json({
            message: error.message || "Error retrieving history",
            error: true,
            success: false
        });
    }
}