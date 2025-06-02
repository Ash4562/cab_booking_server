const GetInTouchModel = require("../model/GetInTouchModel");
const { sendEmail } = require("../utils/email");



exports.GetinTouch = async (req, res) => {
    try {
        const { name, email, contact, message } = req.body;

        if (!name || !email || !contact || !message) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Save to DB
        const newContact = new GetInTouchModel
            ({ name, email, contact, message });
        await newContact.save();

        // Send email to admin
        const emailContent = `
        <h3>New Contact Received</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Contact:</strong> ${contact}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `;

        await sendEmail({
            to: process.env.ADMIN_EMAIL, // put your admin email in env
            
            subject: 'New Contact Received',
            message: emailContent,
        });
        console.log("Sending to:", process.env.ADMIN_EMAIL);

        res.status(201).json({ message: 'Contact submitted and email sent successfully!' });
    } catch (error) {
        console.error('Error submitting Contact:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};
// 