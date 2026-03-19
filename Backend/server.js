import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import { adminNotificationTemplate, userThankYouTemplateConsultancy, userThankYouTemplateContact } from './utils/emailTemplates.js';

dotenv.config();

const app = express();

// ── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (e.g. curl / Postman / server-to-server)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            callback(new Error(`CORS: origin "${origin}" is not allowed`));
        },
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    })
);

app.use(express.json());

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

const transporter_Thankyou = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
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
            transporter_Thankyou.sendMail(userMailOptions)
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
            transporter_Thankyou.sendMail(userMailOptions)
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
