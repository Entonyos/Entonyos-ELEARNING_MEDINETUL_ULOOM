"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Lecture = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var schema = new _mongoose["default"].Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  video: {
    type: String,
    required: true
  },
  course: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "Courses",
    required: true
  },
  createdAt: {
    type: Date,
    "default": Date.now
  }
});

var Lecture = _mongoose["default"].model("Lecture", schema);

exports.Lecture = Lecture;