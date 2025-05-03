"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _course = require("../controllers/course.js");

var _isAuth = require("../middlewares/isAuth.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var router = _express["default"].Router();

router.get("/course/all", _course.getAllCourses);
router.get("/course/:id", _course.getSingleCourse);
router.get("/lectures/:id", _isAuth.isAuth, _course.fetchLectures);
router.get("/lecture/:id", _isAuth.isAuth, _course.fetchLecture);
router.get("/mycourse", _isAuth.isAuth, _course.getMyCourses);
router.post("/course/checkout/:id", _isAuth.isAuth, _course.checkout);
router.post("/verification/:id", _isAuth.isAuth, _course.paymentVerification);
var _default = router;
exports["default"] = _default;