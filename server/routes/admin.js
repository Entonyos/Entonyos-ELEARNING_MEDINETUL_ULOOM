import express from "express";
import { isAdmin, isAuth } from "../middlewares/isAuth.js";
import {
  addLectures,
  createCourse,
  deleteCourse,
  deleteLecture,
  getAllStats,
  getAllUser,
  updateRole,
  updateCourse,
  updateLecture,
} from "../controllers/admin.js";
import { upload } from "../middlewares/multer.js";
import { Courses } from "../models/Courses.js";
import { User } from "../models/User.js";

const router = express.Router();

// Course routes
router.post("/course/new", isAuth, isAdmin, upload.single('image'), createCourse);
router.put("/course/:id", isAuth, isAdmin, upload.single('image'), updateCourse);
router.delete("/course/:id", isAuth, isAdmin, deleteCourse);

// Lecture routes
router.post("/lecture/:id", isAuth, isAdmin, upload.single('file'), addLectures);
router.put("/lecture/:id", isAuth, isAdmin, upload.single('file'), updateLecture);
router.delete("/lecture/:id", isAuth, isAdmin, deleteLecture);

// User routes
router.put("/user/:id", isAuth, isAdmin, updateRole);
router.get("/users", isAuth, isAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('subscription', 'title category duration');
    
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/admin/stats", isAuth, isAdmin, getAllStats);

// Revenue calculation endpoint
router.get("/admin/revenue", isAuth, isAdmin, async (req, res) => {
  try {
    // Get all courses
    const courses = await Courses.find();
    
    // Get all users with subscriptions
    const users = await User.find({ subscription: { $exists: true, $ne: [] } });
    
    // Calculate total revenue
    let totalRevenue = 0;
    let totalPayments = 0;
    
    users.forEach(user => {
      user.subscription.forEach(courseId => {
        const course = courses.find(c => c._id.toString() === courseId.toString());
        if (course) {
          totalRevenue += course.price;
          totalPayments++;
        }
      });
    });
    
    const averagePayment = totalPayments > 0 ? totalRevenue / totalPayments : 0;
    
    res.status(200).json({
      success: true,
      totalRevenue,
      totalPayments,
      averagePayment,
      currency: "ETB"
    });
  } catch (error) {
    console.error("Error calculating revenue:", error);
    res.status(500).json({
      success: false,
      message: "Error calculating revenue"
    });
  }
});
export default router;
