export const adminNotificationTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { padding: 20px; }
        .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 20px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #64748b; font-size: 12px; text-transform: uppercase; }
        .value { font-size: 16px; color: #1e293b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>New Inquiry Received</h2>
        </div>
        <div class="content">
            <div class="field">
                <div class="label">Name</div>
                <div class="value">${data.name}</div>
            </div>
            <div class="field">
                <div class="label">Email</div>
                <div class="value">${data.email}</div>
            </div>
            <div class="field">
                <div class="label">Phone</div>
                <div class="value">${data.phone}</div>
            </div>
            <div class="field">
                <div class="label">Message</div>
                <div class="value">${data.message || 'No message provided'}</div>
            </div>
        </div>
        <div class="footer">
            &copy; ${new Date().getFullYear()} Nexvera Hub. All rights reserved.
        </div>
    </div>
</body>
</html>
`;

export const userThankYouTemplateConsultancy = (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Nexvera Hub Consultancy Request</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f6f9; font-family: Arial, Helvetica, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9; padding:30px 0;">
<tr>
<td align="center">

<!-- Main Container -->
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.05);">

<!-- Header -->
<tr>
<td align="center" style="background:#0f172a; padding:25px 20px;">
<h1 style="margin:0; color:#ffffff; font-size:26px; letter-spacing:1px;">
NEXVERA HUB
</h1>
<p style="margin:6px 0 0 0; color:#cbd5f5; font-size:14px;">
Learn Smart. Build Your Future.
</p>
</td>
</tr>

<!-- Greeting -->
<tr>
<td style="padding:35px 40px 10px 40px;">
<p style="font-size:18px; color:#111827; margin:0;">
Hello <strong>${data.name}</strong>,
</p>
</td>
</tr>

<!-- Thank You Message -->
<tr>
<td style="padding:10px 40px;">
<p style="font-size:15px; color:#4b5563; line-height:1.6; margin:0;">
Thank you for submitting your consultancy request with <strong>Nexvera Hub</strong>.
We truly appreciate your interest in advancing your learning journey with us.
</p>
</td>
</tr>

<!-- Information Section -->
<tr>
<td style="padding:15px 40px;">
<p style="font-size:15px; color:#4b5563; line-height:1.6; margin:0;">
Our team has successfully received your request and will carefully review the details you provided.
One of our learning consultants will contact you shortly to guide you toward the most suitable courses
and learning path based on your goals.
</p>
</td>
</tr>


<!-- CTA Button -->
<tr>
<td align="center" style="padding:30px 40px;">
<a href="https://nexverahub.com"
style="
background:#2563eb;
color:#ffffff;
text-decoration:none;
padding:14px 28px;
border-radius:6px;
font-size:15px;
font-weight:bold;
display:inline-block;
">
Explore Courses
</a>
</td>
</tr>

<!-- Divider -->
<tr>
<td style="padding:0 40px;">
<hr style="border:none; border-top:1px solid #e5e7eb;">
</td>
</tr>

<!-- Social Media -->
<tr>
<td align="center" style="padding:20px 40px;">
<p style="margin:0 0 16px 0; color:#374151; font-size:14px;">
Stay connected with us
</p>

<!-- Instagram -->
<a href="https://www.instagram.com/nexverahub?igsh=MW9jNGkwaDZkdjEybQ==" style="display:inline-block;margin:0 6px;text-decoration:none;">
<span style="display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:#E1306C;">
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
<circle cx="12" cy="12" r="4"/>
<circle cx="17.5" cy="6.5" r="1" fill="#ffffff" stroke="none"/>
</svg>
</span>
</a>

<!-- Facebook -->
<a href="https://www.facebook.com/share/189odEHLZR/?mibextid=wwXIfr" style="display:inline-block;margin:0 6px;text-decoration:none;">
<span style="display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:#1877F2;">
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
</svg>
</span>
</a>

<!-- LinkedIn -->
<a href="https://www.linkedin.com/company/nexverahub/" style="display:inline-block;margin:0 6px;text-decoration:none;">
<span style="display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:#0A66C2;">
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
<rect x="2" y="9" width="4" height="12"/>
<circle cx="4" cy="4" r="2"/>
</svg>
</span>
</a>

<!-- Website -->
<a href="https://nexverahub.com" style="display:inline-block;margin:0 6px;text-decoration:none;">
<span style="display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:#2563eb;">
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<circle cx="12" cy="12" r="10"/>
<line x1="2" y1="12" x2="22" y2="12"/>
<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
</svg>
</span>
</a>

</td>
</tr>

<!-- Footer -->
<tr>
<td align="center" style="background:#f9fafb; padding:25px 40px;">

<p style="margin:0; font-size:14px; color:#374151;">
<strong>Nexvera Hub</strong>
</p>

<p style="margin:6px 0 10px 0; font-size:13px; color:#6b7280;">
Empowering learners with the right knowledge and career guidance.
</p>

<p style="margin:0; font-size:12px; color:#9ca3af;">
© 2026 Nexvera Hub. All rights reserved.
</p>

<p style="margin:8px 0 0 0; font-size:11px; color:#9ca3af;">
If you did not request this consultancy, you may safely ignore this email.
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;

export const userThankYouTemplateContact = (data) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Nexvera Hub - Contact Confirmation</title>
</head>

<body style="margin:0;padding:0;background-color:#f4f6fb;font-family:Arial, Helvetica, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f6fb;padding:20px 0;">
<tr>
<td align="center">

<!-- Main Container -->
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">

<!-- Header -->
<tr>
<td style="background:linear-gradient(135deg,#3b82f6,#6366f1);padding:30px;text-align:center;color:#ffffff;">
<h1 style="margin:0;font-size:28px;letter-spacing:1px;">NEXVERA HUB</h1>
<p style="margin:8px 0 0 0;font-size:14px;opacity:0.9;">Empowering Learning Through Technology</p>
</td>
</tr>

<!-- Greeting -->
<tr>
<td style="padding:30px 40px 10px 40px;color:#333333;">
<p style="font-size:16px;margin:0;">Hello <strong>${data.name}</strong>,</p>
</td>
</tr>

<!-- Thank You -->
<tr>
<td style="padding:10px 40px;color:#555555;font-size:15px;line-height:1.6;">
<p style="margin:0;">
Thank you for contacting <strong>Nexvera Hub</strong>.
We have successfully received your message and truly appreciate you reaching out to us.
</p>
</td>
</tr>

<!-- Confirmation Message -->
<tr>
<td style="padding:15px 40px;color:#555555;font-size:15px;line-height:1.6;">
<p style="margin:0;">
Our team has received your inquiry and will carefully review your message. 
We aim to respond as soon as possible and provide you with the assistance or information you need.
</p>
</td>
</tr>

<!-- Message Preview -->
<tr>
<td style="padding:10px 40px;">
<table width="100%" style="background:#f8fafc;border-radius:6px;padding:15px;">
<tr>
<td style="font-size:14px;color:#444444;">
<strong>Your Message:</strong><br><br>
${data.message}
</td>
</tr>
</table>
</td>
</tr>

<!-- CTA Button -->
<tr>
<td align="center" style="padding:25px 40px;">
<a href="#" 
style="background:#3b82f6;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:6px;font-size:15px;font-weight:bold;display:inline-block;">
Explore Courses
</a>
</td>
</tr>

<!-- Divider -->
<tr>
<td style="padding:10px 40px;">
<hr style="border:none;border-top:1px solid #eeeeee;">
</td>
</tr>

<!-- Social Media -->
<tr>
<td align="center" style="padding:10px 40px 20px 40px;font-size:14px;color:#555555;">
<p style="margin-bottom:16px;"><strong>Connect With Us</strong></p>

<!-- Instagram -->
<a href="https://www.instagram.com/nexverahub?igsh=MW9jNGkwaDZkdjEybQ==" style="display:inline-block;margin:0 6px;text-decoration:none;">
<span style="display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:#E1306C;">
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
<circle cx="12" cy="12" r="4"/>
<circle cx="17.5" cy="6.5" r="1" fill="#ffffff" stroke="none"/>
</svg>
</span>
</a>

<!-- Facebook -->
<a href="https://www.facebook.com/share/189odEHLZR/?mibextid=wwXIfr" style="display:inline-block;margin:0 6px;text-decoration:none;">
<span style="display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:#1877F2;">
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
</svg>
</span>
</a>

<!-- LinkedIn -->
<a href="https://www.linkedin.com/company/nexverahub/" style="display:inline-block;margin:0 6px;text-decoration:none;">
<span style="display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:#0A66C2;">
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
<rect x="2" y="9" width="4" height="12"/>
<circle cx="4" cy="4" r="2"/>
</svg>
</span>
</a>

<!-- Website -->
<a href="https://nexverahub.com" style="display:inline-block;margin:0 6px;text-decoration:none;">
<span style="display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:#2563eb;">
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<circle cx="12" cy="12" r="10"/>
<line x1="2" y1="12" x2="22" y2="12"/>
<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
</svg>
</span>
</a>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="background:#f8fafc;padding:25px 40px;text-align:center;color:#777777;font-size:13px;line-height:1.6;">

<strong>Nexvera Hub</strong><br>
Empowering Students with Knowledge & Skills

<br><br>

© 2026 Nexvera Hub. All rights reserved.

<br><br>

If you did not submit this request, please ignore this email.

<br><br>

<span style="font-size:12px;color:#999999;">
You are receiving this email because you contacted Nexvera Hub.
</span>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;