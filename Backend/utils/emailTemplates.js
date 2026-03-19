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
        <!-- Header -->
        <tr>
        <td align="center" style=" padding:25px 20px;">
        <img style="width: 27vw;" src="https://nexverahub.com/assets/logo-B1jSTEFJ.PNG" alt="NEXVERAHUB"/>
        <p style="margin:6px 0 0 0; color:#3b82f6; font-size:14px;">
        Learn Smart. Build Your Future.
        </p>
        </td>
        </tr>
        
        <!-- Divider -->
        <tr>
        <td style="padding:10px 40px;">
        <hr style="border:0;border-top:2px solid #000000;margin:0;">
        </td>
        </tr>
        
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
<td align="center" style=" padding:25px 20px;">
<img style="width: 27vw;" src="https://nexverahub.com/assets/logo-B1jSTEFJ.PNG" alt="NEXVERAHUB"/>
<p style="margin:6px 0 0 0; color:#3b82f6; font-size:14px;">
Learn Smart. Build Your Future.
</p>
</td>
</tr>

<!-- Divider -->
<tr>
<td style="padding:10px 40px;">
<hr style="border:0;border-top:2px solid #000000;margin:0;">
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
<td align="center" style="padding:10px 20px 20px 20px;font-size:14px;color:#555555;">

<p style="margin:0 0 16px 0;"><strong>Connect With Us</strong></p>

<table border="0" cellspacing="0" cellpadding="0">
<tr>

<!-- Instagram -->
<td align="center" style="padding:0 6px;">
<a href="https://www.instagram.com/nexverahub?igsh=MW9jNGkwaDZkdjEybQ==" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="38" height="38" style="display:block;border-radius:50%;background-color:#E1306C;padding:8px;">
</a>
</td>

<!-- Facebook -->
<td align="center" style="padding:0 6px;">
<a href="https://www.facebook.com/share/189odEHLZR/?mibextid=wwXIfr" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="38" height="38" style="display:block;border-radius:50%;background-color:#1877F2;padding:8px;">
</a>
</td>

<!-- LinkedIn -->
<td align="center" style="padding:0 6px;">
<a href="https://www.linkedin.com/company/nexverahub/" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png" width="38" height="38" style="display:block;border-radius:50%;background-color:#0A66C2;padding:8px;">
</a>
</td>

<!-- Website -->
<td align="center" style="padding:0 6px;">
<a href="https://nexverahub.com" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/1006/1006771.png" width="38" height="38" style="display:block;border-radius:50%;background-color:#2563eb;padding:8px;">
</a>
</td>

</tr>
</table>

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
<td style="padding:30px;text-align:center;color:#ffffff;">
<img style="width: 27vw;" src="https://nexverahub.com/assets/logo-B1jSTEFJ.PNG" alt="NEXVERAHUB"/>
<p style="margin:8px 0 0 0;font-size:14px;opacity:0.9;color:#3b82f6">Empowering Learning Through Technology</p>
</td>
</tr>

<!-- Divider -->
<tr>
<td style="padding:10px 40px;">
<hr style="border:0;border-top:2px solid #000000;margin:0;">
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
<td align="center" style="padding:10px 20px 20px 20px;font-size:14px;color:#555555;">

<p style="margin:0 0 16px 0;"><strong>Connect With Us</strong></p>

<table border="0" cellspacing="0" cellpadding="0">
<tr>

<!-- Instagram -->
<td align="center" style="padding:0 6px;">
<a href="https://www.instagram.com/nexverahub?igsh=MW9jNGkwaDZkdjEybQ==" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="38" height="38" style="display:block;border-radius:50%;background-color:#E1306C;padding:8px;">
</a>
</td>

<!-- Facebook -->
<td align="center" style="padding:0 6px;">
<a href="https://www.facebook.com/share/189odEHLZR/?mibextid=wwXIfr" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="38" height="38" style="display:block;border-radius:50%;background-color:#1877F2;padding:8px;">
</a>
</td>

<!-- LinkedIn -->
<td align="center" style="padding:0 6px;">
<a href="https://www.linkedin.com/company/nexverahub/" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png" width="38" height="38" style="display:block;border-radius:50%;background-color:#0A66C2;padding:8px;">
</a>
</td>

<!-- Website -->
<td align="center" style="padding:0 6px;">
<a href="https://nexverahub.com" target="_blank">
<img src="https://cdn-icons-png.flaticon.com/512/1006/1006771.png" width="38" height="38" style="display:block;border-radius:50%;background-color:#2563eb;padding:8px;">
</a>
</td>

</tr>
</table>

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