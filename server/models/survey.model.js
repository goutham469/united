import mongoose from "mongoose";

const SurveySchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId, // Reference to the Product collection
            required: true,
        },
        form: {
            createdAt: {
                type: Date, // Stores when the form was created
                default: Date.now,
            },
            questions: [
                {
                    question: {
                        type: String, // The question text
                        required: true,
                    },
                    type: {
                        type: String, // Type of question (e.g., "text", "multiple-choice")
                        enum: ["text", "multiple-choice"], // Restrict to allowed types
                        default: "text",
                    },
                    options: {
                        type: [String], // Array of options for multiple-choice questions
                        default: [], // Empty for text-based questions
                    },
                },
            ],
            answers: [
                {
                    userId: {
                        type: mongoose.Schema.Types.ObjectId, // Reference to the User collection
                        required: true,
                    },
                    userDetails: {
                        name: { type: String }, // Optional user details
                        email: { type: String },
                    },
                    responses: [
                        {
                            question: {
                                type: String, // Match the question text
                                required: true,
                            },
                            answer: {
                                type: mongoose.Schema.Types.Mixed, // Flexible to store either text or an array
                                required: true,
                            },
                        },
                    ],
                },
            ],
        },
    },
    {
        timestamps: true,
    }
);

const SurveyModel = mongoose.model("Survey", SurveySchema);

export default SurveyModel;
