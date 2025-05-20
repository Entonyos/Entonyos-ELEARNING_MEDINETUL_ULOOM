// server/routes/admin/userManagement.js
import express from 'express';
import Certificate from "../models/Certificate.js";
import { User } from "../models/User.js";
import { Courses } from "../models/Courses.js";
import { Progress } from '../models/Progress.js';


const router = express.Router();

// Get all users with their course details
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    const usersWithDetails = await Promise.all(users.map(async (user) => {
      // Get user's subscribed courses
      const subscribedCourses = await Courses.find({
        _id: { $in: user.subscription }
      });

      // Get progress for each course
      const courseProgress = await Promise.all(subscribedCourses.map(async (course) => {
        const progress = await Progress.findOne({
          user: user._id,
          course: course._id
        });

        // Get certificate if exists
        const certificate = await Certificate.findOne({
          userId: user._id,
          courseId: course._id
        });

        return {
          courseId: course._id,
          courseName: course.title,
          progress: progress ? (progress.completedLectures.length / course.lectures.length) * 100 : 0,
          status: progress ? 'in_progress' : 'not_started',
          certificateUrl: certificate ? `/api/certificates/${certificate.certificateId}` : null
        };
      }));

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        registeredDate: user.createdAt,
        subscribedCourses: courseProgress
      };
    }));

    res.json(usersWithDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single user with details
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const subscribedCourses = await Courses.find({
      _id: { $in: user.subscription }
    });

    const courseProgress = await Promise.all(subscribedCourses.map(async (course) => {
      const progress = await Progress.findOne({
        user: user._id,
        course: course._id
      });

      const certificate = await Certificate.findOne({
        userId: user._id,
        courseId: course._id
      });

      return {
        courseId: course._id,
        courseName: course.title,
        progress: progress ? (progress.completedLectures.length / course.lectures.length) * 100 : 0,
        status: progress ? 'in_progress' : 'not_started',
        certificateUrl: certificate ? `/api/certificates/${certificate.certificateId}` : null
      };
    }));

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      registeredDate: user.createdAt,
      subscribedCourses: courseProgress
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;