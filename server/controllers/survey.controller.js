import mongoose from 'mongoose';
import SurveyModel from '../models/survey.model.js'
import ViewModel from '../models/views.model.js'


export function surveyRouterEntry(request,response)
{
    return response.json({
        message:'survey router',
        success:true,
        error:false
    })
}

export async function getAllFormSurveys(request , response)
{
    const formsData = await SurveyModel.find();
    response.json({
        message:formsData,
        success:true,
        error:false
    })
}

export async function getAllProductMetrics(request , response)
{
    const metricData = await ViewModel.find();
    response.json({
        message:metricData,
        success:true,
        error:false
    })
}


export async function updateProductViewMetric(request, response) {
    try {
        const { productId, userId, viewedTime, startTime, endTime } = request.body;

        // Validate input
        if (!productId || !userId || viewedTime === undefined || !startTime || !endTime) {
            return response.status(400).json({ error: "Invalid input. All fields are required." });
        }

        // Find the product view document
        let productView = await ViewModel.findOne({ productId });

        // If the productId doesn't exist, create a new document
        if (!productView) {
            productView = new ViewModel({
                productId,
                views: 1, // Increment the views for this new product
                users: [
                    {
                        userId,
                        viewCount: 1, // First view for this user
                        startTime,
                        endTime,
                        viewedTime,
                    },
                ],
                upTime: viewedTime, // Initialize upTime with the viewed time
            });
        } else {
            // Increment the overall view count
            productView.views += 1;

            // Check if the user already exists in the users array
            const userIndex = productView.users.findIndex((u) => u.userId.toString() === userId);

            if (userIndex !== -1) {
                // If user exists, increment their view count and update times
                productView.users[userIndex].viewCount += 1;
                productView.users[userIndex].startTime = startTime;
                productView.users[userIndex].endTime = endTime;
                productView.users[userIndex].viewedTime += viewedTime;
            } else {
                // If user does not exist, add a new user object
                productView.users.push({
                    userId,
                    viewCount: 1,
                    startTime,
                    endTime,
                    viewedTime,
                });
            }

            // Update total uptime
            productView.upTime += viewedTime;
        }

        // Save the updated or new document
        await productView.save();

        return response.status(200).json({ message: "Product view metrics updated successfully." });
    } catch (error) {
        console.error("Error updating product view metrics:", error);
        return response.status(500).json({ error: "Internal Server Error" , message: error });
    }
}



// function to add survey questions for a product
export async function addSurveyQuestion(request, response) 
{
    const { productId, questions } = request.body;

    // Validate input
    if (!productId || !questions || !Array.isArray(questions)) {
        return response.status(400).json({
            message: "Invalid input: productId and questions are required",
            success: false,
            error: true,
        });
    }

    try {
        // Create new survey entry
        const survey = new SurveyModel({
            productId,
            form: {
                questions,
            },
        });

        // Save the survey to the database
        await survey.save();

        console.log("Survey questions added:", survey);
        return response.status(201).json({
            message: "Questions added successfully",
            success: true,
            error: false,
        });
    } catch (error) {
        console.error("Error adding survey questions:", error);
        return response.status(500).json({
            message: "Questions failed to add!",
            success: false,
            error: true,
            err: error.message,
        });
    }
}

export async function getFormDetails(request, response) {
    try {
        const { productId } = request.body;

        // Fetch the form data from the database
        const formData = await SurveyModel.find({productId});

        if (!formData) {
            return response.status(404).json({
                message: 'Form not found',
                success: false,
                error: true,
            });
        }

        // Return the found form data
        response.json({
            message: formData,
            success: true,
            error: false,
        });

    } catch (error) {
        console.error('Error fetching form details:', error);
        response.status(500).json({
            message: 'Internal server error',
            success: false,
            error: true,
        });
    }
}


// Function to submit survey answers
export async function submitSurveyAnswer(request, response) {
    const { productId, userId, userDetails, responses } = request.body;

    // Validate input
    if (!productId || !userId || !responses) {
        return response.status(400).json({
            message: "Invalid input: productId, userId, and responses are required",
            success: false,
            error: true,
        });
    }

    try {
        // Find the survey for the given productId
        const survey = await SurveyModel.findOne({ productId });

        if (!survey) {
            console.log("Survey not found for this product");
            return response.status(404).json({
                message: "Survey not found for this product",
                success: false,
                error: true,
            });
        }

        // Prepare the answer object
        const answer = {
            userId,
            userDetails,
            responses, // Assuming responses is an object where each question's answer is stored
        };

        // Add the answer to the survey
        survey.form.answers.push(answer);
        await survey.save();

        console.log("Survey answers submitted:", survey);
        return response.status(200).json({
            message: "Your survey data has been saved !",
            success: true,
            error: false,
        });
    } catch (error) {
        console.error("Error submitting survey answers:", error);
        return response.status(500).json({
            message: "Failed to save survey data",
            success: false,
            error: true,
            err: error.message,
        });
    }
}
