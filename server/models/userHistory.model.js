import mongoose from "mongoose";

const userHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    viewedTime: {
        type: Date,
        required: true,
        default: Date.now
    }
});

const userHistoryModel = mongoose.model("userhistory", userHistorySchema);

export default userHistoryModel;
