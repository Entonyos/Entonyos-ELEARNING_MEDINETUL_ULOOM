"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resetPassword = exports.forgotPassword = exports.myProfile = exports.loginUser = exports.verifyUser = exports.register = void 0;

var _User = require("../models/User.js");

var _bcrypt = _interopRequireDefault(require("bcrypt"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _sendMail = _interopRequireWildcard(require("../middlewares/sendMail.js"));

var _TryCatch = _interopRequireDefault(require("../middlewares/TryCatch.js"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var register = (0, _TryCatch["default"])(function _callee(req, res) {
  var _req$body, email, name, password, user, hashPassword, otp, activationToken, data;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _req$body = req.body, email = _req$body.email, name = _req$body.name, password = _req$body.password;
          _context.next = 3;
          return regeneratorRuntime.awrap(_User.User.findOne({
            email: email
          }));

        case 3:
          user = _context.sent;

          if (!user) {
            _context.next = 6;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            message: "User Already exists"
          }));

        case 6:
          _context.next = 8;
          return regeneratorRuntime.awrap(_bcrypt["default"].hash(password, 10));

        case 8:
          hashPassword = _context.sent;
          user = {
            name: name,
            email: email,
            password: hashPassword
          };
          otp = Math.floor(Math.random() * 1000000);
          activationToken = _jsonwebtoken["default"].sign({
            user: user,
            otp: otp
          }, process.env.Activation_Secret, {
            expiresIn: "5m"
          });
          data = {
            name: name,
            otp: otp
          };
          _context.next = 15;
          return regeneratorRuntime.awrap((0, _sendMail["default"])(email, "E learning", data));

        case 15:
          res.status(200).json({
            message: "Otp send to your mail",
            activationToken: activationToken
          });

        case 16:
        case "end":
          return _context.stop();
      }
    }
  });
});
exports.register = register;
var verifyUser = (0, _TryCatch["default"])(function _callee2(req, res) {
  var _req$body2, otp, activationToken, verify;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _req$body2 = req.body, otp = _req$body2.otp, activationToken = _req$body2.activationToken;
          verify = _jsonwebtoken["default"].verify(activationToken, process.env.Activation_Secret);

          if (verify) {
            _context2.next = 4;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            message: "Otp Expired"
          }));

        case 4:
          if (!(verify.otp !== otp)) {
            _context2.next = 6;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            message: "Wrong Otp"
          }));

        case 6:
          _context2.next = 8;
          return regeneratorRuntime.awrap(_User.User.create({
            name: verify.user.name,
            email: verify.user.email,
            password: verify.user.password
          }));

        case 8:
          res.json({
            message: "User Registered"
          });

        case 9:
        case "end":
          return _context2.stop();
      }
    }
  });
});
exports.verifyUser = verifyUser;
var loginUser = (0, _TryCatch["default"])(function _callee3(req, res) {
  var _req$body3, email, password, user, mathPassword, token;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _req$body3 = req.body, email = _req$body3.email, password = _req$body3.password;
          _context3.next = 3;
          return regeneratorRuntime.awrap(_User.User.findOne({
            email: email
          }));

        case 3:
          user = _context3.sent;

          if (user) {
            _context3.next = 6;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            message: "No User with this email"
          }));

        case 6:
          _context3.next = 8;
          return regeneratorRuntime.awrap(_bcrypt["default"].compare(password, user.password));

        case 8:
          mathPassword = _context3.sent;

          if (mathPassword) {
            _context3.next = 11;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            message: "wrong Password"
          }));

        case 11:
          token = _jsonwebtoken["default"].sign({
            _id: user._id
          }, process.env.JWT_SECRET, {
            expiresIn: "15d"
          });
          res.json({
            message: "Welcome back ".concat(user.name),
            token: token,
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              subscription: user.subscription
            }
          });

        case 13:
        case "end":
          return _context3.stop();
      }
    }
  });
});
exports.loginUser = loginUser;
var myProfile = (0, _TryCatch["default"])(function _callee4(req, res) {
  var user;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(_User.User.findById(req.user._id));

        case 2:
          user = _context4.sent;
          res.json({
            user: user
          });

        case 4:
        case "end":
          return _context4.stop();
      }
    }
  });
});
exports.myProfile = myProfile;
var forgotPassword = (0, _TryCatch["default"])(function _callee5(req, res) {
  var email, user, token, data;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          email = req.body.email;
          _context5.next = 3;
          return regeneratorRuntime.awrap(_User.User.findOne({
            email: email
          }));

        case 3:
          user = _context5.sent;

          if (user) {
            _context5.next = 6;
            break;
          }

          return _context5.abrupt("return", res.status(404).json({
            message: "No User with this email"
          }));

        case 6:
          token = _jsonwebtoken["default"].sign({
            email: email
          }, process.env.Forgot_Secret);
          data = {
            email: email,
            token: token
          };
          _context5.next = 10;
          return regeneratorRuntime.awrap((0, _sendMail.sendForgotMail)("E learning", data));

        case 10:
          user.resetPasswordExpire = Date.now() + 5 * 60 * 1000;
          _context5.next = 13;
          return regeneratorRuntime.awrap(user.save());

        case 13:
          res.json({
            message: "Reset Password Link is send to you mail"
          });

        case 14:
        case "end":
          return _context5.stop();
      }
    }
  });
});
exports.forgotPassword = forgotPassword;
var resetPassword = (0, _TryCatch["default"])(function _callee6(req, res) {
  var decodedData, user, password;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          decodedData = _jsonwebtoken["default"].verify(req.query.token, process.env.Forgot_Secret);
          _context6.next = 3;
          return regeneratorRuntime.awrap(_User.User.findOne({
            email: decodedData.email
          }));

        case 3:
          user = _context6.sent;

          if (user) {
            _context6.next = 6;
            break;
          }

          return _context6.abrupt("return", res.status(404).json({
            message: "No user with this email"
          }));

        case 6:
          if (!(user.resetPasswordExpire === null)) {
            _context6.next = 8;
            break;
          }

          return _context6.abrupt("return", res.status(400).json({
            message: "Token Expired"
          }));

        case 8:
          if (!(user.resetPasswordExpire < Date.now())) {
            _context6.next = 10;
            break;
          }

          return _context6.abrupt("return", res.status(400).json({
            message: "Token Expired"
          }));

        case 10:
          _context6.next = 12;
          return regeneratorRuntime.awrap(_bcrypt["default"].hash(req.body.password, 10));

        case 12:
          password = _context6.sent;
          user.password = password;
          user.resetPasswordExpire = null;
          _context6.next = 17;
          return regeneratorRuntime.awrap(user.save());

        case 17:
          res.json({
            message: "Password Reset"
          });

        case 18:
        case "end":
          return _context6.stop();
      }
    }
  });
});
exports.resetPassword = resetPassword;