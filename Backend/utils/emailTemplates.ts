export const adminNotificationTemplate = (data: any) => `
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
        <img style="width: 27vw;" src="https://nexverahub.com/logo.png" alt="NEXVERAHUB"/>
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

export const userThankYouTemplateConsultancy = (data: any) => `
<!DOCTYPE html>
<html>
<head>
    <title>Nexvera Hub Consultancy Email</title>
</head>

<body style="margin:0; background:linear-gradient(to bottom right, #e6f0ff, #4a7bdc); font-family:Arial, sans-serif;">

<table width="100%" cellspacing="0" cellpadding="0">
<tr>
<td align="center">

<!-- Main Container -->
<table width="600" cellspacing="0" cellpadding="0" style="background:#f5f7fb; margin-top:40px; border-radius:20px;">

<!-- Logo -->
<tr>
<td align="center">
<br>
<img src="https://nexverahub.com/logo.png" width="150">
</td>
</tr>

<!-- Icon -->
<tr>
<td align="center">
<br>
<div style="width:80px; height:80px; background:#3b6edc; border-radius:50%; line-height:80px; color:white; font-size:40px;">
📘
</div>
</td>
</tr>

<!-- Heading -->
<tr>
<td align="center">
<h2 style="color:#1e2a55;">Consultancy Request Received!</h2>
<p style="color:#3b6edc; font-weight:bold;">We're Here to Guide You</p>
</td>
</tr>

<!-- Content -->
<tr>
<td style="padding-left:40px; padding-right:40px;">
<p><b>Hi ${data.name},</b></p>

<p style="color:#555;">
Thank you for reaching out to Nexvera Hub for consultancy. We've received your request for guidance on choosing the right course and career path.
</p>

<p style="color:#555;">
Our expert team will carefully review your details and help you make the best decision for your future.
</p>
</td>
</tr>

<!-- Info Box -->
<tr>
<td align="center">

<table width="520" cellspacing="0" cellpadding="0" style="background:#e9efff; border-radius:10px;">

<tr>
<td style="padding-left:20px; padding-top:15px;">
🎯 <b style="color:#1e2a55;">What Happens Next?</b>
</td>
</tr>

<tr>
<td style="padding-left:40px;">
Our consultants will analyze your goals and preferences.
</td>
</tr>

<tr>
<td style="padding-left:40px;">
You will receive personalized guidance for courses and career direction.
</td>
</tr>

<tr>
<td style="padding-left:20px; padding-top:15px;">
⏱ <b style="color:#1e2a55;">Response Time</b>
</td>
</tr>

<tr>
<td style="padding-left:40px; padding-bottom:15px;">
We will connect with you within 24 hours.
</td>
</tr>

</table>

</td>
</tr>

<!-- Signature -->
<tr>
<td align="center">
<br>
<p>Best Regards,</p>
<b>The Nexvera Hub Consultancy Team</b>
</td>
</tr>

<!-- Footer -->
<tr>
<td align="center" style="background:linear-gradient(to right, #4a7bdc, #3b6edc); color:white; border-bottom-left-radius:20px; border-bottom-right-radius:20px;">

<br>

<p>Guiding You Towards the Right Future.</p>

<p style="font-size:12px;">
🌐 <a href="https://www.nexverahub.com/" style="color:white; text-decoration:none;">www.nexverahub.com</a> &nbsp;&nbsp;
✉ contact@nexverahub.com
</p>

<!-- Social Icons -->
<p>

<a href="https://www.instagram.com/nexverahub" style="text-decoration:none; margin-right:10px;">
<img src="https://img.icons8.com/ios-filled/50/ffffff/instagram-new.png" width="20">
</a>

<a href="https://www.facebook.com/share/189odEHLZR/?mibextid=wwXIfr" style="text-decoration:none; margin-right:10px;">
<img src="https://img.icons8.com/ios-filled/50/ffffff/facebook-new.png" width="20">
</a>

<a href="https://www.linkedin.com/company/nexverahub/" style="text-decoration:none;">
<img src="https://img.icons8.com/ios-filled/50/ffffff/linkedin.png" width="20">
</a>

</p>

<p style="font-size:12px;">
©️ 2026 Nexvera Hub. All rights reserved.
</p>

<br>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;

export const userThankYouTemplateContact = (data: any) => `
<!DOCTYPE html>
<html>
<head>
    <title>Nexvera Hub Email</title>
</head>

<body style="margin:0; background:linear-gradient(to bottom right, #e6f0ff, #4a7bdc); font-family:Arial, sans-serif;">

<table width="100%" cellspacing="0" cellpadding="0">
<tr>
<td align="center">

<!-- Main Container -->
<table width="600" cellspacing="0" cellpadding="0" style="background:#f5f7fb; margin-top:40px; border-radius:20px;">

<!-- Logo -->
<tr>
<td align="center">
<br>
<img src="https://nexverahub.com/logo.png" width="150">
</td>
</tr>

<!-- Check Icon -->
<tr>
<td align="center">
<br>
<div style="width:80px; height:80px; background:#3b6edc; border-radius:50%; line-height:80px; color:white; font-size:40px;">
✓
</div>
</td>
</tr>

<!-- Heading -->
<tr>
<td align="center">
<h2 style="color:#1e2a55;">Thank You for Reaching Out!</h2>
<p style="color:#3b6edc; font-weight:bold;">We've Received Your Message</p>
</td>
</tr>

<!-- Content -->
<tr>
<td style="padding-left:40px; padding-right:40px;">
<p><b>Hi ${data.name},</b></p>

<p style="color:#555;">
Thank you for contacting Nexvera Hub. We've received your message and our team will review it shortly.
</p>

<p style="color:#555;">
We're excited to help you on your learning journey!
</p>
</td>
</tr>

<!-- Info Box -->
<tr>
<td align="center">

<table width="520" cellspacing="0" cellpadding="0" style="background:#e9efff; border-radius:10px;">

<tr>
<td style="padding-left:20px; padding-top:15px;">
⏱ <b style="color:#1e2a55;">What's Next?</b>
</td>
</tr>

<tr>
<td style="padding-left:40px;">
Our team will get back to you within 24 hours.
</td>
</tr>

<tr>
<td style="padding-left:20px; padding-top:15px;">
✉ <b style="color:#1e2a55;">Need Immediate Help?</b>
</td>
</tr>

<tr>
<td style="padding-left:40px; padding-bottom:15px;">
You can reply to this email or visit our website for more resources.
</td>
</tr>

</table>

</td>
</tr>

<!-- Signature -->
<tr>
<td align="center">
<br>
<p>Best Regards,</p>
<b>The Nexvera Hub Team</b>
</td>
</tr>

<!-- Footer -->
<tr>
<td align="center" style="background:linear-gradient(to right, #4a7bdc, #3b6edc); color:white; border-bottom-left-radius:20px; border-bottom-right-radius:20px;">

<br>

<p>Empowering Learners. Building Futures.</p>

<p style="font-size:12px;">
🌐 <a href="https://www.nexverahub.com/" style="color:white; text-decoration:none;">www.nexverahub.com</a> &nbsp;&nbsp;
✉ contact@nexverahub.com
</p>

<!-- Social Icons -->
<p>

<a href="https://www.instagram.com/nexverahub" style="text-decoration:none; margin-right:10px;">
<img src="https://img.icons8.com/ios-filled/50/ffffff/instagram-new.png" width="20">
</a>

<a href="https://www.facebook.com/share/189odEHLZR/?mibextid=wwXIfr" style="text-decoration:none; margin-right:10px;">
<img src="https://img.icons8.com/ios-filled/50/ffffff/facebook-new.png" width="20">
</a>

<a href="https://www.linkedin.com/company/nexverahub/" style="text-decoration:none;">
<img src="https://img.icons8.com/ios-filled/50/ffffff/linkedin.png" width="20">
</a>

</p>

<p style="font-size:12px;">
©️ 2026 Nexvera Hub. All rights reserved.
</p>

<br>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;

export const loginTemplate = (data: any) => `
<!DOCTYPE html>
<html>
<head>
    <title>Nexvera Hub Login Email</title>
</head>

<body style="margin:0; background:linear-gradient(to bottom right, #e6f0ff, #4a7bdc); font-family:Arial, sans-serif;">

<table width="100%" cellspacing="0" cellpadding="0">
<tr>
<td align="center">

<!-- Main Container -->
<table width="600" cellspacing="0" cellpadding="0" style="background:#f5f7fb; margin-top:40px; border-radius:20px;">

<!-- Logo -->
<tr>
<td align="center">
<br>
<img src="https://nexverahub.com/logo.png" width="150">
</td>
</tr>

<!-- Icon -->
<tr>
<td align="center">
<br>
<div style="width:80px; height:80px; background:#3b6edc; border-radius:50%; line-height:80px; color:white; font-size:40px;">
👋
</div>
</td>
</tr>

<!-- Heading -->
<tr>
<td align="center">
<h2 style="color:#1e2a55;">Welcome Back!</h2>
<p style="color:#3b6edc; font-weight:bold;">You’ve Successfully Logged In</p>
</td>
</tr>

<!-- Content -->
<tr>
<td style="padding-left:40px; padding-right:40px;">
<p><b>Hi ${data.name},</b></p>

<p style="color:#555;">
We noticed that you’ve just logged into your Nexvera Hub account. Welcome back!
</p>

<p style="color:#555;">
Continue your learning journey, explore courses, and keep building your future with us.
</p>
</td>
</tr>

<!-- Info Box -->
<tr>
<td align="center">

<table width="520" cellspacing="0" cellpadding="0" style="background:#e9efff; border-radius:10px;">

<tr>
<td style="padding-left:20px; padding-top:15px;">
🔐 <b style="color:#1e2a55;">Account Activity</b>
</td>
</tr>

<tr>
<td style="padding-left:40px;">
If this login was you, you’re all set to continue learning.
</td>
</tr>

<tr>
<td style="padding-left:20px; padding-top:15px;">
⚠ <b style="color:#1e2a55;">Not You?</b>
</td>
</tr>

<tr>
<td style="padding-left:40px; padding-bottom:15px;">
If you didn’t log in, please reset your password immediately or contact our support team.
</td>
</tr>

</table>

</td>
</tr>

<!-- Signature -->
<tr>
<td align="center">
<br>
<p>Happy Learning,</p>
<b>The Nexvera Hub Team</b>
</td>
</tr>

<!-- Footer -->
<tr>
<td align="center" style="background:linear-gradient(to right, #4a7bdc, #3b6edc); color:white; border-bottom-left-radius:20px; border-bottom-right-radius:20px;">

<br>

<p>Empowering Learners. Building Futures.</p>

<p style="font-size:12px;">
🌐 <a href="https://www.nexverahub.com/" style="color:white; text-decoration:none;">www.nexverahub.com</a> &nbsp;&nbsp;
✉ contact@nexverahub.com
</p>

<!-- Social Icons -->
<p>

<a href="https://www.instagram.com/nexverahub" style="text-decoration:none; margin-right:10px;">
<img src="https://img.icons8.com/ios-filled/50/ffffff/instagram-new.png" width="20">
</a>

<a href="https://www.facebook.com/share/189odEHLZR/?mibextid=wwXIfr" style="text-decoration:none; margin-right:10px;">
<img src="https://img.icons8.com/ios-filled/50/ffffff/facebook-new.png" width="20">
</a>

<a href="https://www.linkedin.com/company/nexverahub/" style="text-decoration:none;">
<img src="https://img.icons8.com/ios-filled/50/ffffff/linkedin.png" width="20">
</a>

</p>

<p style="font-size:12px;">
©️ 2026 Nexvera Hub. All rights reserved.
</p>

<br>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;

export const welcomeTemplate = (data: any) => `
<!DOCTYPE html>
<html>
<head>
    <title>Nexvera Hub Signup Email</title>
</head>

<body style="margin:0; background:linear-gradient(to bottom right, #e6f0ff, #4a7bdc); font-family:Arial, sans-serif;">

<table width="100%" cellspacing="0" cellpadding="0">
<tr>
<td align="center">

<!-- Main Container -->
<table width="600" cellspacing="0" cellpadding="0" style="background:#f5f7fb; margin-top:40px; border-radius:20px;">

<!-- Logo -->
<tr>
<td align="center">
<br>
<img src="https://nexverahub.com/logo.png" width="150">
</td>
</tr>

<!-- Icon -->
<tr>
<td align="center">
<br>
<div style="width:80px; height:80px; background:#3b6edc; border-radius:50%; line-height:80px; color:white; font-size:40px;">
🎉
</div>
</td>
</tr>

<!-- Heading -->
<tr>
<td align="center">
<h2 style="color:#1e2a55;">Welcome to Nexvera Hub!</h2>
<p style="color:#3b6edc; font-weight:bold;">Your Account Has Been Created Successfully</p>
</td>
</tr>

<!-- Content -->
<tr>
<td style="padding-left:40px; padding-right:40px;">
<p><b>Hi ${data.name},</b></p>

<p style="color:#555;">
Congratulations! Your Nexvera Hub account has been successfully created.
</p>

<p style="color:#555;">
You’re now part of a platform designed to help you learn, grow, and achieve your goals.
</p>
</td>
</tr>

<!-- Info Box -->
<tr>
<td align="center">

<table width="520" cellspacing="0" cellpadding="0" style="background:#e9efff; border-radius:10px;">

<tr>
<td style="padding-left:20px; padding-top:15px;">
🚀 <b style="color:#1e2a55;">Get Started</b>
</td>
</tr>

<tr>
<td style="padding-left:40px;">
Explore courses tailored to your interests.
</td>
</tr>

<tr>
<td style="padding-left:40px;">
Start learning and build real-world skills.
</td>
</tr>

<tr>
<td style="padding-left:20px; padding-top:15px;">
💡 <b style="color:#1e2a55;">Need Guidance?</b>
</td>
</tr>

<tr>
<td style="padding-left:40px; padding-bottom:15px;">
Get consultancy support to choose the right path for your career.
</td>
</tr>

</table>

</td>
</tr>

<!-- Signature -->
<tr>
<td align="center">
<br>
<p>Welcome aboard,</p>
<b>The Nexvera Hub Team</b>
</td>
</tr>

<!-- Footer -->
<tr>
<td align="center" style="background:linear-gradient(to right, #4a7bdc, #3b6edc); color:white; border-bottom-left-radius:20px; border-bottom-right-radius:20px;">

<br>

<p>Empowering Learners. Building Futures.</p>

<p style="font-size:12px;">
🌐 <a href="https://www.nexverahub.com/" style="color:white; text-decoration:none;">www.nexverahub.com</a> &nbsp;&nbsp;
✉ contact@nexverahub.com
</p>

<!-- Social Icons -->
<p>

<a href="https://www.instagram.com/nexverahub" style="text-decoration:none; margin-right:10px;">
<img src="https://img.icons8.com/ios-filled/50/ffffff/instagram-new.png" width="20">
</a>

<a href="https://www.facebook.com/share/189odEHLZR/?mibextid=wwXIfr" style="text-decoration:none; margin-right:10px;">
<img src="https://img.icons8.com/ios-filled/50/ffffff/facebook-new.png" width="20">
</a>

<a href="https://www.linkedin.com/company/nexverahub/" style="text-decoration:none;">
<img src="https://img.icons8.com/ios-filled/50/ffffff/linkedin.png" width="20">
</a>

</p>

<p style="font-size:12px;">
©️ 2026 Nexvera Hub. All rights reserved.
</p>

<br>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;