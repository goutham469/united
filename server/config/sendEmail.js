import nodemailer from "nodemailer"

async function sendEmail(toEmail, subject ,  htmlBody) 
{
    try 
    {
        // Configure the transporter (SMTP settings)
        const transporter = nodemailer.createTransport({
            service: "gmail", 
            auth: {
              user: process.env.SENDER_EMAIL,
              pass: process.env.EMAIL_PASS,
            },
            tls: {
              rejectUnauthorized: false
            },
            port: 587,  // Try using port 587
            secure: false,  // Set secure to false for port 587
          });
          

        // Email options
        const mailOptions = {
            from: process.env.SENDER_EMAIL ,
            to: toEmail,
            subject: subject,
            html: htmlBody, // Email content in HTML format
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.response);
        return info.response;
    } 
    catch (error) 
    {
        console.error("Error sending email:", error);
        throw error;
    }
}

export default sendEmail

