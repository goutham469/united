import { generateDealsEmailTemplate } from '../utils/emailTemplate.js';
import { sendDealsEmail } from '../utils/emailService.js';
import UserModel from '../models/user.model.js';

export const sendDealsNotification = async (req, res) => {
    try {
        // Get all deals from the request
        const { deals } = req.body;

        if (!deals || !Array.isArray(deals) || deals.length === 0) {
            return res.status(400).json({
                message: "No deals provided",
                error: true,
                success: false
            });
        }

        // Process deals data to include full URLs for images and format data for email
        const processedDeals = deals.map(deal => ({
            name: deal.name,
            price: deal.price || 0,
            description: deal.description || 'No description available',
            image: Array.isArray(deal.image) && deal.image.length > 0 
                ? (deal.image[0].startsWith('http') ? deal.image[0] : `${process.env.BASE_URL}${deal.image[0]}`)
                : `${process.env.BASE_URL}/default-product.png`,
            productId: deal._id,
            link: `${process.env.CLIENT_URL}/product/${deal._id}`
        }));

        // Generate email HTML content
        const htmlContent = generateDealsEmailTemplate(processedDeals);

        // Get all users' emails
        const users = await UserModel.find({}, 'email');
        const emails = users.map(user => user.email).filter(Boolean); // Filter out any null/undefined emails

        if (emails.length === 0) {
            return res.status(404).json({
                message: "No users found to send notification",
                error: true,
                success: false
            });
        }

        // Send email to users in batches of 50 to avoid SMTP limits
        const batchSize = 50;
        for (let i = 0; i < emails.length; i += batchSize) {
            const batch = emails.slice(i, i + batchSize);
            await sendDealsEmail(
                batch.join(','),
                '🔥 Hot Deals Alert! Check Out Our Latest Offers',
                htmlContent
            );
        }

        return res.json({
            message: `Deals notification sent successfully to ${emails.length} users`,
            success: true,
            error: false
        });

    } catch (error) {
        console.error('Error sending deals notification:', error);
        return res.status(500).json({
            message: error.message || "Error sending deals notification",
            error: true,
            success: false
        });
    }
}; 