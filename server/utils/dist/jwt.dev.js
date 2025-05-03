"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verifyToken = exports.generateToken = void 0;

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _dotenv = _interopRequireDefault(require("dotenv"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

_dotenv["default"].config();

var JWT_CONFIG = {
  algorithm: 'HS256',
  expiresIn: process.env.JWT_EXPIRES_IN || '1d'
};

var generateToken = function generateToken(payload) {
  return _jsonwebtoken["default"].sign(payload, process.env.JWT_SECRET, JWT_CONFIG);
};

exports.generateToken = generateToken;

var verifyToken = function verifyToken(token) {
  try {
    return _jsonwebtoken["default"].verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      ignoreExpiration: false
    });
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    throw error;
  }
};

exports.verifyToken = verifyToken;