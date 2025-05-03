import express from 'express';
import { Testimonial } from '../models/Testimonial.js';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify token
const auth = async (req, res, next) => {
  try {
    const token = req.headers.token;
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all testimonials with user details
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find()
      .populate({
        path: 'userId',
        select: 'name profileImage',
        model: 'User'
      })
      .sort({ createdAt: -1 });
    
    // Transform the data to include proper image URLs
    const transformedTestimonials = testimonials.map(testimonial => ({
      ...testimonial.toObject(),
      user: {
        name: testimonial.userId.name,
        profileImage: testimonial.userId.profileImage
      }
    }));

    res.json(transformedTestimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ message: 'Error fetching testimonials' });
  }
});

// Add new testimonial
router.post('/', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    const testimonial = new Testimonial({
      userId,
      message
    });

    await testimonial.save();
    
    // Populate user data before sending response
    const populatedTestimonial = await Testimonial.findById(testimonial._id)
      .populate({
        path: 'userId',
        select: 'name profileImage',
        model: 'User'
      });

    // Transform the data to include proper image URLs
    const transformedTestimonial = {
      ...populatedTestimonial.toObject(),
      user: {
        name: populatedTestimonial.userId.name,
        profileImage: populatedTestimonial.userId.profileImage
      }
    };

    res.status(201).json(transformedTestimonial);
  } catch (error) {
    console.error('Error adding testimonial:', error);
    res.status(500).json({ message: 'Error adding testimonial' });
  }
});

export default router; 