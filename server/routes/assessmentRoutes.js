import express from "express";
import { auth } from "../middlewares/auth.js";
import {
  createAssessment,
  getAssessment,
  submitAssessment,
  getAssessmentStatus,
  deleteAssessment
} from "../controllers/assessmentController.js";

const router = express.Router();

// Create assessment (admin only)
router.post("/course/:courseId", auth, createAssessment);

// Get assessment
router.get("/course/:courseId", auth, getAssessment);

// Delete assessment
router.delete("/:id", auth, deleteAssessment);

// Submit assessment
router.post("/course/:courseId/submit", auth, submitAssessment);

// Get assessment status
router.get("/status/:courseId", auth, getAssessmentStatus);

export default router; 