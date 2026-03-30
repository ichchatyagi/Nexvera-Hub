import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { CreateContactDto } from './dto/create-contact.dto';
import { AppConfigService } from '../app-config/app-config.service';
import { adminNotificationTemplate, userThankYouTemplateContact, userThankYouTemplateConsultancy } from './templates/contact.templates';

@Injectable()
export class ContactService {
  private transporter: nodemailer.Transporter;
  private thankYouTransporter: nodemailer.Transporter;

  constructor(private appConfig: AppConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: this.appConfig.emailUser,
        pass: this.appConfig.emailPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    this.thankYouTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: this.appConfig.senderEmail,
        pass: this.appConfig.senderPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendContact(createContactDto: CreateContactDto) {
    const { name, email, phone, message } = createContactDto;

    try {
      // 1. Send Admin Notification
      const adminMailOptions = {
        from: `"Nexvera Form" <${this.appConfig.emailUser}>`,
        to: this.appConfig.recipientEmail,
        subject: `New Inquiry from ${name}`,
        html: adminNotificationTemplate({ name, email, phone, message }),
      };

      // 2. Send Thank You Mail to User
      const userMailOptions = {
        from: `"Nexvera Hub" <${this.appConfig.senderEmail}>`,
        to: email,
        subject: 'Thank you for contacting Nexvera Hub',
        html: userThankYouTemplateContact({ name, message }),
      };

      // Send both emails
      await Promise.all([
        this.transporter.sendMail(adminMailOptions),
        this.thankYouTransporter.sendMail(userMailOptions),
      ]);

      return { success: true, message: 'Emails sent successfully' };
    } catch (error) {
      console.error('Nodemailer Error:', error);
      throw new InternalServerErrorException('Failed to send emails');
    }
  }

  async sendConsultancy(createContactDto: CreateContactDto) {
    const { name, email, phone, message } = createContactDto;

    try {
      // 1. Send Admin Notification
      const adminMailOptions = {
        from: `"Nexvera Form" <${this.appConfig.emailUser}>`,
        to: this.appConfig.recipientEmail,
        subject: `New Consultancy Request from ${name}`,
        html: adminNotificationTemplate({ name, email, phone, message }),
      };

      // 2. Send Thank You Mail to User
      const userMailOptions = {
        from: `"Nexvera Hub" <${this.appConfig.senderEmail}>`,
        to: email,
        subject: 'Nexvera Hub Consultancy Request Confirmation',
        html: userThankYouTemplateConsultancy({ name, message }),
      };

      // Send both emails
      await Promise.all([
        this.transporter.sendMail(adminMailOptions),
        this.thankYouTransporter.sendMail(userMailOptions),
      ]);

      return { success: true, message: 'Emails sent successfully' };
    } catch (error) {
      console.error('Nodemailer Error:', error);
      throw new InternalServerErrorException('Failed to send emails');
    }
  }
}
