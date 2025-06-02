// const ContactusModel = require("../models/ContactusModel");
// const { sendEmail } = require("../utils/email");

const ContactusModel = require("../model/ContactusModel");
const { sendEmail } = require("../utils/email");

exports.createContact = async (req, res) => {
    try {
        const { name, emailorcontact, message } = req.body;
        console.log(req.body);

        if (!name || !emailorcontact || !message) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Save to DB
        const newContact = new ContactusModel({ name, emailorcontact, message });
        await newContact.save();

        // Send email to admin
        const emailContent = `
            <h3>New Contact Received</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email or Contact:</strong> ${emailorcontact}</p>
            <p><strong>Message:</strong> ${message}</p>
        `;

        await sendEmail({
            to: process.env.ADMIN_EMAIL,
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
