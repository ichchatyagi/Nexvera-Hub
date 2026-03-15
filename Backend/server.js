import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import { adminNotificationTemplate, userThankYouTemplateConsultancy, userThankYouTemplateContact } from './utils/emailTemplates.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

app.post('/api/consultancy', async (req, res) => {
    const { name, email, phone, message } = req.body;

    try {
        // 1. Send Admin Notification
        const adminMailOptions = {
            from: `"Nexvera Form" <${process.env.EMAIL_USER}>`,
            to: process.env.RECIPIENT_EMAIL,
            subject: `New Inquiry from ${name}`,
            html: adminNotificationTemplate({ name, email, phone, message }),
        };

        // 2. Send Thank You Mail to User
        const userMailOptions = {
            from: `"Nexvera Hub" <${process.env.SENDER_EMAIL}>`,
            to: email,
            subject: 'Thank you for contacting Nexvera Hub',
            html: userThankYouTemplateConsultancy({ name, message }),
        };

        // Send both emails
        await Promise.all([
            transporter.sendMail(adminMailOptions),
            transporter.sendMail(userMailOptions)
        ]);

        res.status(200).json({ success: true, message: 'Emails sent successfully' });
    } catch (error) {
        console.error('Nodemailer Error:', error);
        res.status(500).json({ success: false, message: 'Failed to send emails' });
    }
});

app.post('/api/contact', async (req, res) => {
    const { name, email, phone, message } = req.body;

    try {
        // 1. Send Admin Notification
        const adminMailOptions = {
            from: `"Nexvera Form" <${process.env.EMAIL_USER}>`,
            to: process.env.RECIPIENT_EMAIL,
            subject: `New Inquiry from ${name}`,
            html: adminNotificationTemplate({ name, email, phone, message }),
        };

        // 2. Send Thank You Mail to User
        const userMailOptions = {
            from: `"Nexvera Hub" <${process.env.SENDER_EMAIL}>`,
            to: email,
            subject: 'Thank you for contacting Nexvera Hub',
            html: userThankYouTemplateContact({ name, message }),
        };

        // Send both emails
        await Promise.all([
            transporter.sendMail(adminMailOptions),
            transporter.sendMail(userMailOptions)
        ]);

        res.status(200).json({ success: true, message: 'Emails sent successfully' });
    } catch (error) {
        console.error('Nodemailer Error:', error);
        res.status(500).json({ success: false, message: 'Failed to send emails' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
