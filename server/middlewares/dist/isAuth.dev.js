"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isAdmin = exports.isAuth = void 0;

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _User = require("../models/User.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var isAuth = function isAuth(req, res, next) {
  var token, decodedData;
  return regeneratorRuntime.async(function isAuth$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          token = req.headers.token;

          if (token) {
            _context.next = 4;
            break;
          }

          return _context.abrupt("return", res.status(403).json({
            message: "Please Login"
          }));

        case 4:
          decodedData = _jsonwebtoken["default"].verify(token, process.env.JWT_SECRET);
          _context.next = 7;
          return regeneratorRuntime.awrap(_User.User.findById(decodedData._id));

        case 7:
          req.user = _context.sent;
          next();
          _context.next = 15;
          break;

        case 11:
          _context.prev = 11;
          _context.t0 = _context["catch"](0);
          console.error("Auth error:", _context.t0);
          res.status(500).json({
            message: "Login First",
            error: _context.t0.message
          });

        case 15:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 11]]);
};

exports.isAuth = isAuth;

var isAdmin = function isAdmin(req, res, next) {
  try {
    if (req.user.role !== "admin") return res.status(403).json({
      message: "You are not admin"
    });
    next();
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.isAdmin = isAdmin;