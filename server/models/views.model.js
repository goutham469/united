import mongoose from "mongoose";

const userViewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    viewCount: {
        type: Number,
        default: 1,
    },
    startTime: {
        type: String, // Adjust the type as per your requirements (e.g., `Date` for precise timestamps)
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    },
    viewedTime: {
        type: Number,
        required: true,
    },
});

const viewsSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        users: {
            type: [userViewSchema], // Nested schema to store detailed user information
            default: [],
        },
        upTime: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const ViewModel = mongoose.model("View", viewsSchema);

export default ViewModel;
