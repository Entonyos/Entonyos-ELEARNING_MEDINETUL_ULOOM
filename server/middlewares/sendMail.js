import { createTransport } from "nodemailer";

const sendMail = async (email, subject, data) => {
  const transport = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: process.env.Gmail,
      pass: process.env.Password,
    },
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .container {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        h1 {
            color: red;
        }
        p {
            margin-bottom: 20px;
            color: #666;
        }
        .otp {
            font-size: 36px;
            color: #7b68ee; /* Purple text */
            margin-bottom: 30px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>OTP Verification</h1>
        <p>Hello ${data.name} your (One-Time Password) for your account verification is.</p>
        <p class="otp">${data.otp}</p> 
    </div>
</body>
</html>
`;

  await transport.sendMail({
    from: process.env.Gmail,
    to: email,
    subject,
    html,
  });
};

export default sendMail;

export const sendForgotMail = async (subject, data) => {
  try {
    const transport = createTransport({
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: process.env.Gmail,
        pass: process.env.Password,
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${data.token}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f3f3f3;
      margin: 0;
      padding: 0;
    }
    .container {
      background-color: #ffffff;
      padding: 20px;
      margin: 20px auto;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      max-width: 600px;
    }
    h1 {
      color: #5a2d82;
    }
    p {
      color: #666666;
    }
    .button {
      display: inline-block;
      padding: 15px 25px;
      margin: 20px 0;
      background-color: #5a2d82;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
    }
    .button:hover {
      background-color: #4a2372;
    }
    .footer {
      margin-top: 20px;
      color: #999999;
      text-align: center;
    }
    .footer a {
      color: #5a2d82;
      text-decoration: none;
    }
    .link {
      color: #5a2d82;
      text-decoration: underline;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Reset Your Password</h1>
    <p>Hello ${data.name},</p>
    <p>You have requested to reset your password. Please click the button below to reset your password.</p>
    <a href="${resetUrl}" class="button">Reset Password</a>
    <p>Or copy and paste this link in your browser:</p>
    <p class="link">${resetUrl}</p>
    <p>If you did not request this, please ignore this email.</p>
    <p>This link will expire in 5 minutes.</p>
    <div class="footer">
      <p>Thank you,<br>E-Learning Team</p>
    </div>
  </div>
</body>
</html>
`;

    await transport.sendMail({
      from: process.env.Gmail,
      to: data.email,
      subject,
      html,
    });
  } catch (error) {
    console.error("Error sending forgot password email:", error);
    throw new Error("Failed to send reset email");
  }
};
