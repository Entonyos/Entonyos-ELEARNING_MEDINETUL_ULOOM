"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Progress = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var schema = new _mongoose["default"].Schema({
  course: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "Courses"
  },
  completedLectures: [{
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "Lecture"
  }],
  user: {
    type: _mongoose["default"].Schema.Types.ObjectId,
    ref: "User"
  }
}, {
  timestamps: true
});

var Progress = _mongoose["default"].model("Progress", schema);

exports.Progress = Progress;