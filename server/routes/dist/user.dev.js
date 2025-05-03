"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _user = require("../controllers/user.js");

var _isAuth = require("../middlewares/isAuth.js");

var _course = require("../controllers/course.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var router = _express["default"].Router();

router.post("/user/register", _user.register);
router.post("/user/verify", _user.verifyUser);
router.post("/user/login", _user.loginUser);
router.get("/user/me", _isAuth.isAuth, _user.myProfile);
router.post("/user/forgot", _user.forgotPassword);
router.post("/user/reset", _user.resetPassword);
router.post("/user/progress", _isAuth.isAuth, _course.addProgress);
router.get("/user/progress", _isAuth.isAuth, _course.getYourProgress);
var _default = router;
exports["default"] = _default;