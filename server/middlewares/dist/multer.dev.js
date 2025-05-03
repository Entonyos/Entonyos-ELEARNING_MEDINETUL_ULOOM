"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uploadFiles = void 0;

var _multer = _interopRequireDefault(require("multer"));

var _uuid = require("uuid");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var storage = _multer["default"].diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, "uploads");
  },
  filename: function filename(req, file, cb) {
    var id = (0, _uuid.v4)();
    var extName = file.originalname.split(".").pop();
    var fileName = "".concat(id, ".").concat(extName);
    cb(null, fileName);
  }
});

var uploadFiles = (0, _multer["default"])({
  storage: storage
}).single("image");
exports.uploadFiles = uploadFiles;