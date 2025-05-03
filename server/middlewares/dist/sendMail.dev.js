"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendForgotMail = exports["default"] = void 0;

var _nodemailer = require("nodemailer");

var sendMail = function sendMail(email, subject, data) {
  var transport, html;
  return regeneratorRuntime.async(function sendMail$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          transport = (0, _nodemailer.createTransport)({
            host: "smtp.gmail.com",
            port: 465,
            auth: {
              user: process.env.Gmail,
              pass: process.env.Password
            }
          });
          html = "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>OTP Verification</title>\n    <style>\n        body {\n            font-family: Arial, sans-serif;\n            margin: 0;\n            padding: 0;\n            display: flex;\n            justify-content: center;\n            align-items: center;\n            height: 100vh;\n        }\n        .container {\n            background-color: #fff;\n            padding: 20px;\n            border-radius: 8px;\n            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n            text-align: center;\n        }\n        h1 {\n            color: red;\n        }\n        p {\n            margin-bottom: 20px;\n            color: #666;\n        }\n        .otp {\n            font-size: 36px;\n            color: #7b68ee; /* Purple text */\n            margin-bottom: 30px;\n        }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <h1>OTP Verification</h1>\n        <p>Hello ".concat(data.name, " your (One-Time Password) for your account verification is.</p>\n        <p class=\"otp\">").concat(data.otp, "</p> \n    </div>\n</body>\n</html>\n");
          _context.next = 4;
          return regeneratorRuntime.awrap(transport.sendMail({
            from: process.env.Gmail,
            to: email,
            subject: subject,
            html: html
          }));

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
};

var _default = sendMail;
exports["default"] = _default;

var sendForgotMail = function sendForgotMail(subject, data) {
  var transport, html;
  return regeneratorRuntime.async(function sendForgotMail$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          transport = (0, _nodemailer.createTransport)({
            host: "smtp.gmail.com",
            port: 465,
            auth: {
              user: process.env.Gmail,
              pass: process.env.Password
            }
          });
          html = "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Reset Your Password</title>\n  <style>\n    body {\n      font-family: Arial, sans-serif;\n      background-color: #f3f3f3;\n      margin: 0;\n      padding: 0;\n    }\n    .container {\n      background-color: #ffffff;\n      padding: 20px;\n      margin: 20px auto;\n      border-radius: 8px;\n      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);\n      max-width: 600px;\n    }\n    h1 {\n      color: #5a2d82;\n    }\n    p {\n      color: #666666;\n    }\n    .button {\n      display: inline-block;\n      padding: 15px 25px;\n      margin: 20px 0;\n      background-color: #5a2d82;\n      color: white;\n      text-decoration: none;\n      border-radius: 4px;\n      font-size: 16px;\n    }\n    .footer {\n      margin-top: 20px;\n      color: #999999;\n      text-align: center;\n    }\n    .footer a {\n      color: #5a2d82;\n      text-decoration: none;\n    }\n  </style>\n</head>\n<body>\n  <div class=\"container\">\n    <h1>Reset Your Password</h1>\n    <p>Hello,</p>\n    <p>You have requested to reset your password. Please click the button below to reset your password.</p>\n    <a href=\"".concat(process.env.frontendurl, "/reset-password/").concat(data.token, "\" class=\"button\">Reset Password</a>\n    <p>If you did not request this, please ignore this email.</p>\n    <div class=\"footer\">\n      <p>Thank you,<br>Your Website Team</p>\n      <p><a href=\"https://yourwebsite.com\">yourwebsite.com</a></p>\n    </div>\n  </div>\n</body>\n</html>\n");
          _context2.next = 4;
          return regeneratorRuntime.awrap(transport.sendMail({
            from: process.env.Gmail,
            to: data.email,
            subject: subject,
            html: html
          }));

        case 4:
        case "end":
          return _context2.stop();
      }
    }
  });
};

exports.sendForgotMail = sendForgotMail;