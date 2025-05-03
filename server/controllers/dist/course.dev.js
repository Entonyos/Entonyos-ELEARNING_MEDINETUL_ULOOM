"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getYourProgress = exports.addProgress = exports.paymentVerification = exports.checkout = exports.getMyCourses = exports.fetchLecture = exports.fetchLectures = exports.getSingleCourse = exports.getAllCourses = void 0;

var _TryCatch = _interopRequireDefault(require("../middlewares/TryCatch.js"));

var _Courses = require("../models/Courses.js");

var _Lecture = require("../models/Lecture.js");

var _User = require("../models/User.js");

var _crypto = _interopRequireDefault(require("crypto"));

var _Payment = require("../models/Payment.js");

var _Progress = require("../models/Progress.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var getAllCourses = (0, _TryCatch["default"])(function _callee(req, res) {
  var courses;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(_Courses.Courses.find());

        case 2:
          courses = _context.sent;
          res.json({
            courses: courses
          });

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
});
exports.getAllCourses = getAllCourses;
var getSingleCourse = (0, _TryCatch["default"])(function _callee2(req, res) {
  var course;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(_Courses.Courses.findById(req.params.id));

        case 2:
          course = _context2.sent;
          res.json({
            course: course
          });

        case 4:
        case "end":
          return _context2.stop();
      }
    }
  });
});
exports.getSingleCourse = getSingleCourse;
var fetchLectures = (0, _TryCatch["default"])(function _callee3(req, res) {
  var lectures, user;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(_Lecture.Lecture.find({
            course: req.params.id
          }));

        case 2:
          lectures = _context3.sent;
          _context3.next = 5;
          return regeneratorRuntime.awrap(_User.User.findById(req.user._id));

        case 5:
          user = _context3.sent;

          if (!(user.role === "admin")) {
            _context3.next = 8;
            break;
          }

          return _context3.abrupt("return", res.json({
            lectures: lectures
          }));

        case 8:
          if (user.subscription.includes(req.params.id)) {
            _context3.next = 10;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            message: "You have not subscribed to this course"
          }));

        case 10:
          res.json({
            lectures: lectures
          });

        case 11:
        case "end":
          return _context3.stop();
      }
    }
  });
});
exports.fetchLectures = fetchLectures;
var fetchLecture = (0, _TryCatch["default"])(function _callee4(req, res) {
  var lecture, user;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(_Lecture.Lecture.findById(req.params.id));

        case 2:
          lecture = _context4.sent;
          _context4.next = 5;
          return regeneratorRuntime.awrap(_User.User.findById(req.user._id));

        case 5:
          user = _context4.sent;

          if (!(user.role === "admin")) {
            _context4.next = 8;
            break;
          }

          return _context4.abrupt("return", res.json({
            lecture: lecture
          }));

        case 8:
          if (user.subscription.includes(lecture.course)) {
            _context4.next = 10;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            message: "You have not subscribed to this course"
          }));

        case 10:
          res.json({
            lecture: lecture
          });

        case 11:
        case "end":
          return _context4.stop();
      }
    }
  });
});
exports.fetchLecture = fetchLecture;
var getMyCourses = (0, _TryCatch["default"])(function _callee5(req, res) {
  var user, courses;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          console.log("Getting courses for user:", req.user._id);
          _context5.next = 4;
          return regeneratorRuntime.awrap(_User.User.findById(req.user._id));

        case 4:
          user = _context5.sent;

          if (user) {
            _context5.next = 8;
            break;
          }

          console.log("User not found:", req.user._id);
          return _context5.abrupt("return", res.status(404).json({
            success: false,
            message: "User not found"
          }));

        case 8:
          console.log("User subscriptions:", user.subscription); // Get all courses where the ID is in the user's subscription array

          _context5.next = 11;
          return regeneratorRuntime.awrap(_Courses.Courses.find({
            _id: {
              $in: user.subscription
            }
          }));

        case 11:
          courses = _context5.sent;
          console.log("Found enrolled courses:", courses.length);
          res.json({
            success: true,
            courses: courses,
            message: "Found ".concat(courses.length, " enrolled courses")
          });
          _context5.next = 20;
          break;

        case 16:
          _context5.prev = 16;
          _context5.t0 = _context5["catch"](0);
          console.error("Error fetching enrolled courses:", _context5.t0);
          res.status(500).json({
            success: false,
            message: "Error fetching enrolled courses",
            error: _context5.t0.message
          });

        case 20:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 16]]);
});
exports.getMyCourses = getMyCourses;
var checkout = (0, _TryCatch["default"])(function _callee6(req, res) {
  var user, course, options, order;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.next = 2;
          return regeneratorRuntime.awrap(_User.User.findById(req.user._id));

        case 2:
          user = _context6.sent;
          _context6.next = 5;
          return regeneratorRuntime.awrap(_Courses.Courses.findById(req.params.id));

        case 5:
          course = _context6.sent;

          if (!user.subscription.includes(course._id)) {
            _context6.next = 8;
            break;
          }

          return _context6.abrupt("return", res.status(400).json({
            message: "You already have this course"
          }));

        case 8:
          options = {
            amount: Number(course.price * 100),
            currency: "INR"
          };
          _context6.next = 11;
          return regeneratorRuntime.awrap(instance.orders.create(options));

        case 11:
          order = _context6.sent;
          res.status(201).json({
            order: order,
            course: course
          });

        case 13:
        case "end":
          return _context6.stop();
      }
    }
  });
});
exports.checkout = checkout;
var paymentVerification = (0, _TryCatch["default"])(function _callee7(req, res) {
  var _req$body, razorpay_order_id, razorpay_payment_id, razorpay_signature, body, expectedSignature, isAuthentic, user, course;

  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _req$body = req.body, razorpay_order_id = _req$body.razorpay_order_id, razorpay_payment_id = _req$body.razorpay_payment_id, razorpay_signature = _req$body.razorpay_signature;
          body = razorpay_order_id + "|" + razorpay_payment_id;
          expectedSignature = _crypto["default"].createHmac("sha256", process.env.Razorpay_Secret).update(body).digest("hex");
          isAuthentic = expectedSignature === razorpay_signature;

          if (!isAuthentic) {
            _context7.next = 21;
            break;
          }

          _context7.next = 7;
          return regeneratorRuntime.awrap(_Payment.Payment.create({
            razorpay_order_id: razorpay_order_id,
            razorpay_payment_id: razorpay_payment_id,
            razorpay_signature: razorpay_signature
          }));

        case 7:
          _context7.next = 9;
          return regeneratorRuntime.awrap(_User.User.findById(req.user._id));

        case 9:
          user = _context7.sent;
          _context7.next = 12;
          return regeneratorRuntime.awrap(_Courses.Courses.findById(req.params.id));

        case 12:
          course = _context7.sent;
          user.subscription.push(course._id);
          _context7.next = 16;
          return regeneratorRuntime.awrap(_Progress.Progress.create({
            course: course._id,
            completedLectures: [],
            user: req.user._id
          }));

        case 16:
          _context7.next = 18;
          return regeneratorRuntime.awrap(user.save());

        case 18:
          res.status(200).json({
            message: "Course Purchased Successfully"
          });
          _context7.next = 22;
          break;

        case 21:
          return _context7.abrupt("return", res.status(400).json({
            message: "Payment Failed"
          }));

        case 22:
        case "end":
          return _context7.stop();
      }
    }
  });
});
exports.paymentVerification = paymentVerification;
var addProgress = (0, _TryCatch["default"])(function _callee8(req, res) {
  var progress, lectureId;
  return regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.next = 2;
          return regeneratorRuntime.awrap(_Progress.Progress.findOne({
            user: req.user._id,
            course: req.query.course
          }));

        case 2:
          progress = _context8.sent;
          lectureId = req.query.lectureId;

          if (!progress.completedLectures.includes(lectureId)) {
            _context8.next = 6;
            break;
          }

          return _context8.abrupt("return", res.json({
            message: "Progress recorded"
          }));

        case 6:
          progress.completedLectures.push(lectureId);
          _context8.next = 9;
          return regeneratorRuntime.awrap(progress.save());

        case 9:
          res.status(201).json({
            message: "new Progress added"
          });

        case 10:
        case "end":
          return _context8.stop();
      }
    }
  });
});
exports.addProgress = addProgress;
var getYourProgress = (0, _TryCatch["default"])(function _callee9(req, res) {
  var progress, allLectures, completedLectures, courseProgressPercentage;
  return regeneratorRuntime.async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _context9.next = 2;
          return regeneratorRuntime.awrap(_Progress.Progress.find({
            user: req.user._id,
            course: req.query.course
          }));

        case 2:
          progress = _context9.sent;

          if (progress) {
            _context9.next = 5;
            break;
          }

          return _context9.abrupt("return", res.status(404).json({
            message: "null"
          }));

        case 5:
          _context9.next = 7;
          return regeneratorRuntime.awrap(_Lecture.Lecture.find({
            course: req.query.course
          }));

        case 7:
          allLectures = _context9.sent.length;
          completedLectures = progress[0].completedLectures.length;
          courseProgressPercentage = completedLectures * 100 / allLectures;
          res.json({
            courseProgressPercentage: courseProgressPercentage,
            completedLectures: completedLectures,
            allLectures: allLectures,
            progress: progress
          });

        case 11:
        case "end":
          return _context9.stop();
      }
    }
  });
});
exports.getYourProgress = getYourProgress;