"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.User = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var schema = new _mongoose["default"].Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    "default": "user"
  },
  mainrole: {
    type: String,
    "default": "user"
  },
  subscription: [{
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "Courses"
  }],
  resetPasswordExpire: Date
}, {
  timestamps: true
});

var User = _mongoose["default"].model("User", schema);

exports.User = User;