import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./database/db.js";
import cors from "cors";
import axios from "axios";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "./models/User.js";
import { Courses } from "./models/Courses.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import testimonialRoutes from './routes/testimonial.js';
import blogRoutes from "./routes/blog.js";
import chatRoutes from "./routes/chat.js";
import { createTransport } from "nodemailer";
import PDFDocument from 'pdfkit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

// Middlewares
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'token'],
  credentials: true
}));

// Add explicit OPTIONS handling for preflight requests
app.options('*', cors());

const port = process.env.PORT || 5001;

// Chapa Configuration
const CHAPA_AUTH_KEY = process.env.CHAPA_AUTH_KEY;
const CHAPA_BASE_URL = "https://api.chapa.co/v1/transaction";

// Verify Chapa configuration on startup
if (!CHAPA_AUTH_KEY) {
  console.error("FATAL ERROR: CHAPA_AUTH_KEY is not defined");
  process.exit(1);
}

// Basic route
app.get("/", (req, res) => {
  res.send("Server is working");
});

// Static files with proper CORS headers
app.use('/uploads', (req, res, next) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Accept-Ranges', 'bytes');
  
  // Set content type based on file extension and path
  const ext = path.extname(req.path).toLowerCase();
  const filePath = req.path.toLowerCase();
  
  if (filePath.includes('/lectures/') && ext === '.mp4') {
    res.setHeader('Content-Type', 'video/mp4');
  } else if (filePath.includes('/profiles/') || filePath.includes('/blog/')) {
    if (ext === '.jpg' || ext === '.jpeg') {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (ext === '.png') {
      res.setHeader('Content-Type', 'image/png');
    } else if (ext === '.gif') {
      res.setHeader('Content-Type', 'image/gif');
    } else if (ext === '.webp') {
      res.setHeader('Content-Type', 'image/webp');
    }
  } else if (ext === '.pdf') {
    res.setHeader('Content-Type', 'application/pdf');
  } else if (['.mp3', '.wav', '.ogg', '.m4a'].includes(ext)) {
    const mimeTypes = {
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.m4a': 'audio/mp4'
    };
    res.setHeader('Content-Type', mimeTypes[ext] || 'audio/mpeg');
  }
  
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Payment Initialization Endpoint
app.post("/api/payment/initialize", async (req, res) => {
  try {
    // 1. Validate token header
    const token = req.headers.token;
    console.log("Received headers:", {
      ...req.headers,
      token: token ? "Present" : "Missing"
    });

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token required",
        code: "MISSING_TOKEN"
      });
    }

    // 2. Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256'],
        ignoreExpiration: false
      });
      console.log("Token decoded successfully:", {
        userId: decoded._id,
        iat: new Date(decoded.iat * 1000).toISOString(),
        exp: new Date(decoded.exp * 1000).toISOString()
      });
    } catch (jwtError) {
      console.error("JWT verification error:", {
        name: jwtError.name,
        message: jwtError.message,
        expiredAt: jwtError.expiredAt,
        stack: jwtError.stack
      });
      return res.status(401).json({
        success: false,
        message: jwtError.message,
        code: jwtError.name === 'TokenExpiredError' ? "TOKEN_EXPIRED" : "INVALID_TOKEN"
      });
    }

    const {       
      amount, 
      email, 
      courseId,
      userId,
      courseTitle 
    } = req.body;

    // Validate required fields
    if (!amount || !email || !courseId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment fields"
      });
    }

    // Generate unique transaction reference
    const tx_ref = `course-${courseId}-${Date.now()}`;
    
    // Prepare payment data
    const paymentData = {
      amount: String(Math.round(amount)),
      currency: "ETB",
      email,
      first_name: "Customer",
      tx_ref,
      callback_url: `${process.env.FRONTEND_URL}/payment-success?tx_ref=${tx_ref}`,
      return_url: `${process.env.FRONTEND_URL}/payment-success?tx_ref=${tx_ref}`,
      customization: {
        title: courseTitle ? courseTitle.substring(0, 16) : "Course Payment",
        description: "Course Enrollment"
      }
    };

    console.log("Payment initialization data:", {
      ...paymentData,
      callback_url: paymentData.callback_url
    });

    const headers = {
      Authorization: `Bearer ${CHAPA_AUTH_KEY}`,
      "Content-Type": "application/json"
    };

    // Initialize payment with Chapa
    const response = await axios.post(
      `${CHAPA_BASE_URL}/initialize`,
      paymentData,
      { headers, timeout: 10000 }
    );

    console.log("Chapa response:", response.data);

    res.status(200).json({
      success: true,
      checkoutUrl: response.data.data.checkout_url,
      tx_ref,
      message: "Payment initialized successfully"
    });

  } catch (error) {
    console.error("Payment initialization error:", error);
    res.status(error.response?.status || 500).json({
      success: false,
      message: "Payment initialization failed",
      details: error.response?.data?.message || error.message
    });
  }
});

// Add receipt route
app.get('/api/receipt/:tx_ref', async (req, res) => {
  try {
    const { tx_ref } = req.params;
    
    // Verify transaction
    const chapaResponse = await axios.get(
      `${CHAPA_BASE_URL}/verify/${tx_ref}`,
      {
        headers: {
          "Authorization": `Bearer ${CHAPA_AUTH_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (!chapaResponse.data || !chapaResponse.data.data) {
      return res.status(404).send('Receipt not found');
    }

    const transaction = chapaResponse.data.data;
    const courseId = tx_ref.split('-')[1];
    
    // Get course and user details
    const course = await Courses.findById(courseId);
    const user = await User.findOne({ 'subscription': courseId });

    if (!course || !user) {
      return res.status(404).send('Receipt not found');
    }

    // Read receipt template
    const templatePath = path.join(__dirname, 'templates', 'receipt.html');
    let receiptTemplate = fs.readFileSync(templatePath, 'utf8');

    // Replace placeholders
    receiptTemplate = receiptTemplate
      .replace('{{userName}}', user.name)
      .replace('{{courseTitle}}', course.title)
      .replace('{{transactionId}}', tx_ref)
      .replace('{{amount}}', `ETB ${transaction.amount}`)
      .replace('{{enrollmentDate}}', new Date(transaction.created_at).toLocaleDateString())
      .replace('{{generationDate}}', new Date().toLocaleString())
      .replace('{{courseUrl}}', `${process.env.FRONTEND_URL}/course/${courseId}`);

    // Check if PDF is requested
    if (req.query.format === 'pdf') {
      try {
        // Create a PDF document
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          info: {
            Title: 'Enrollment Receipt',
            Author: 'E-Learning Platform',
            Subject: 'Course Enrollment Confirmation'
          }
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=enrollment-receipt-${tx_ref}.pdf`);

        // Pipe the PDF to the response
        doc.pipe(res);

        // Read the receipt template
        const templatePath = path.join(__dirname, 'templates', 'enrollment-confirmation.html');
        const receiptTemplate = fs.readFileSync(templatePath, 'utf8');

        // Replace placeholders in the template
        const filledTemplate = receiptTemplate
          .replace('{{userName}}', user.name)
          .replace('{{courseTitle}}', course.title)
          .replace('{{transactionId}}', tx_ref)
          .replace('{{amount}}', `ETB ${transaction.amount}`)
          .replace('{{enrollmentDate}}', new Date(transaction.created_at).toLocaleDateString())
          .replace('{{generationDate}}', new Date().toLocaleString())
          .replace('{{courseUrl}}', `${process.env.FRONTEND_URL}/course/${course._id}`);

        // Add the receipt content to PDF
        doc
          .fontSize(24)
          .font('Helvetica-Bold')
          .text('E-LEARNING PLATFORM', { align: 'center' })
          .moveDown(0.5)
          .fontSize(18)
          .text('ENROLLMENT RECEIPT', { align: 'center' })
          .moveDown(1);

        // Add receipt details
        const startX = 50;
        const startY = doc.y;
        const col1 = startX;
        const col2 = startX + 200;

        // Draw receipt box
        doc
          .rect(startX, startY, 500, 250)
          .stroke();

        // Add receipt content
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('Receipt Details:', col1, startY + 20)
          .font('Helvetica')
          .text('Student Name:', col1, startY + 50)
          .text(user.name, col2, startY + 50)
          .text('Course Title:', col1, startY + 70)
          .text(course.title, col2, startY + 70)
          .text('Transaction ID:', col1, startY + 90)
          .text(tx_ref, col2, startY + 90)
          .text('Amount Paid:', col1, startY + 110)
          .text(`ETB ${transaction.amount}`, col2, startY + 110)
          .text('Enrollment Date:', col1, startY + 130)
          .text(new Date(transaction.created_at).toLocaleDateString(), col2, startY + 130)
          .text('Payment Method:', col1, startY + 150)
          .text(transaction.payment_method || 'Online Payment', col2, startY + 150)
          .text('Course Duration:', col1, startY + 170)
          .text(course.duration || 'Not specified', col2, startY + 170)
          .text('Course Level:', col1, startY + 190)
          .text(course.level || 'Not specified', col2, startY + 190)
          .text('Course Instructor:', col1, startY + 210)
          .text(course.instructor || 'Not specified', col2, startY + 210);

        // Add course description
        doc
          .moveDown(2)
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('Course Description:', col1)
          .font('Helvetica')
          .text(course.description || 'No description available', {
            width: 500,
            align: 'left'
          });

        // Add footer
        doc
          .moveDown(2)
          .fontSize(10)
          .text('This is an official receipt for your course enrollment', { align: 'center' })
          .text('Please keep this receipt for your records', { align: 'center' })
          .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' })
          .moveDown(1)
          .text('Thank you for choosing our platform!', { align: 'center' });

        // Add page border
        doc
          .rect(30, 30, 535, 755)
          .stroke();

        // Finalize the PDF
        doc.end();

        // Don't send any other response after doc.end()
        return;
      } catch (pdfError) {
        console.error('Error generating PDF:', pdfError);
        res.status(500).send('Error generating PDF');
        return;
      }
    }

    res.send(receiptTemplate);
  } catch (error) {
    console.error('Error generating receipt:', error);
    res.status(500).send('Error generating receipt');
  }
});

//Payment Verification and Enrollment Endpoint
app.post("/api/payment/verify-enroll", async (req, res) => {
  try {
    // 1. Validate token header
    const token = req.headers.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token required",
        code: "MISSING_TOKEN"
      });
    }

    // 2. Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256'],
        ignoreExpiration: false
      });
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return res.status(401).json({
        success: false,
        message: jwtError.message,
        code: jwtError.name === 'TokenExpiredError' ? "TOKEN_EXPIRED" : "INVALID_TOKEN"
      });
    }

    // 3. Validate request body
    const { tx_ref } = req.body;
    if (!tx_ref || typeof tx_ref !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Valid transaction reference required",
        code: "INVALID_TX_REF"
      });
    }

    console.log("Verifying transaction:", tx_ref);
    console.log("Using Chapa API Key:", CHAPA_AUTH_KEY ? "Present" : "Missing");

    // 4. Verify with Chapa API
    const chapaResponse = await axios.get(
      `${CHAPA_BASE_URL}/verify/${tx_ref}`,
      {
        headers: {
          "Authorization": `Bearer ${CHAPA_AUTH_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    console.log("Chapa verification response:", chapaResponse.data);

    // Check if the transaction exists and is successful
    if (!chapaResponse.data || !chapaResponse.data.data) {
      return res.status(402).json({
        success: false,
        message: "Transaction not found",
        code: "TRANSACTION_NOT_FOUND",
        details: chapaResponse.data
      });
    }

    const transaction = chapaResponse.data.data;
    if (transaction.status !== 'success') {
      return res.status(402).json({
        success: false,
        message: "Transaction was not successful",
        code: "TRANSACTION_FAILED",
        details: transaction
      });
    }

    // 5. Process enrollment
    const courseId = tx_ref.split('-')[1];
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course reference",
        code: "INVALID_COURSE_ID"
      });
    }

    // Find the course first
    const course = await Courses.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
        code: "COURSE_NOT_FOUND"
      });
    }

    // Update user's subscription
    const user = await User.findByIdAndUpdate(
      decoded._id,
      { $addToSet: { subscription: courseId } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND"
      });
    }

    // Send confirmation email
    try {
      // Check if email was already sent for this transaction
      const emailSentKey = `email_sent_${tx_ref}`;
      if (global[emailSentKey]) {
        console.log("Email already sent for transaction:", tx_ref);
        return;
      }

      // Mark email as being sent
      global[emailSentKey] = true;

      // Read email template
      const templatePath = path.join(__dirname, 'templates', 'enrollment-confirmation.html');
      let emailTemplate = fs.readFileSync(templatePath, 'utf8');

      // Generate PDF receipt
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: 'Enrollment Receipt',
          Author: 'E-Learning Platform',
          Subject: 'Course Enrollment Confirmation'
        }
      });

      // Create a buffer to store the PDF
      const pdfChunks = [];
      doc.on('data', chunk => pdfChunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(pdfChunks);

        // Replace placeholders in email template
        emailTemplate = emailTemplate
          .replace('{{userName}}', user.name)
          .replace('{{courseTitle}}', course.title)
          .replace('{{transactionId}}', tx_ref)
          .replace('{{amount}}', `ETB ${transaction.amount}`)
          .replace('{{enrollmentDate}}', new Date(transaction.created_at).toLocaleDateString())
          .replace('{{generationDate}}', new Date().toLocaleString())
          .replace('{{courseUrl}}', `${process.env.FRONTEND_URL}/course/${course._id}`);

        // Create email transport
        const transport = createTransport({
          host: "smtp.gmail.com",
          port: 465,
          auth: {
            user: process.env.Gmail,
            pass: process.env.Password,
          },
        });

        // Send email with PDF attachment
        transport.sendMail({
          from: process.env.Gmail,
          to: user.email,
          subject: "Course Enrollment Confirmation",
          html: emailTemplate,
          attachments: [
            {
              filename: `enrollment-receipt-${tx_ref}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }
          ]
        })
        .then(() => {
          console.log("Confirmation email sent to:", user.email);
        })
        .catch((emailError) => {
          console.error("Error sending confirmation email:", emailError);
          // Remove the email sent flag if sending fails
          delete global[emailSentKey];
        });
      });

      // Add logo to the PDF
      const logoPath = path.join(__dirname, '../frontend/src/assets/logo.jpg');
      doc.image(logoPath, {
        fit: [150, 150],
        align: 'center'
      });

      // Add header
      doc
        .moveDown(2)
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('MEDINETUL ULOOM', { align: 'center' })
        .fontSize(16)
        .text('ISLAMIC ACADEMY AND SOCIAL SERVICES', { align: 'center' })
        .moveDown(0.5)
        .fontSize(18)
        .text('ENROLLMENT RECEIPT', { align: 'center' })
        .moveDown(1);

      // Style the receipt box with a gradient background
      const startX = 50;
      const startY = doc.y;
      const boxWidth = 500;
      const boxHeight = 300;

      // Draw a styled box for receipt details
      doc
        .rect(startX, startY, boxWidth, boxHeight)
        .fillAndStroke('#f8f9fa', '#343a40');

      const col1 = startX + 20;
      const col2 = startX + 220;

      // Add receipt content with improved styling
      doc
        .fill('#000000')
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Receipt Details:', col1, startY + 20)
        .moveDown(0.5)
        .fontSize(12)
        .font('Helvetica');

      // Function to add styled row
      const addRow = (label, value, yOffset) => {
        doc
          .font('Helvetica-Bold')
          .text(label, col1, yOffset)
          .font('Helvetica')
          .text(value, col2, yOffset);
      };

      // Add receipt details with consistent spacing
      addRow('Student Name:', user.name, startY + 50);
      addRow('Course Title:', course.title, startY + 80);
      addRow('Transaction ID:', tx_ref, startY + 110);
      addRow('Amount Paid:', `ETB ${transaction.amount}`, startY + 140);
      addRow('Enrollment Date:', new Date(transaction.created_at).toLocaleDateString(), startY + 170);
      addRow('Payment Method:', transaction.payment_method || 'Online Payment', startY + 200);
      addRow('Course Duration:', course.duration || 'Not specified', startY + 230);
      addRow('Course Level:', course.level || 'Not specified', startY + 260);

      // Add course description with styled box
      doc
        .moveDown(4)
        .rect(startX, doc.y, boxWidth, 100)
        .fillAndStroke('#ffffff', '#343a40')
        .fill('#000000')
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Course Description:', col1)
        .moveDown(0.5)
        .fontSize(12)
        .font('Helvetica')
        .text(course.description || 'No description available', {
          width: boxWidth - 40,
          align: 'left'
        });

      // Add styled footer
      doc
        .moveDown(2)
        .rect(startX, doc.y, boxWidth, 100)
        .fillAndStroke('#f8f9fa', '#343a40')
        .fill('#000000')
        .fontSize(10)
        .text('This is an official receipt for your course enrollment', { align: 'center' })
        .text('Please keep this receipt for your records', { align: 'center' })
        .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' })
        .moveDown(1)
        .font('Helvetica-Bold')
        .text('Thank you for choosing Medinetul Uloom!', { align: 'center' });

      // Add decorative border
      doc
        .rect(30, 30, 535, 780)
        .lineWidth(2)
        .stroke('#343a40');

      // Finalize the PDF
      doc.end();

    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      // Don't fail the request if email fails
    }

    return res.status(200).json({
      success: true,
      message: "Enrollment successful",
      courseId,
      chapaResponse: chapaResponse.data
    });

  } catch (error) {
    console.error("Verification error:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });

    const status = error.response?.status || 500;
    const code = status === 401 ? "AUTH_ERROR" : 
                status === 402 ? "PAYMENT_VERIFICATION_FAILED" : 
                "SERVER_ERROR";

    return res.status(status).json({
      success: false,
      message: error.message,
      code,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
});

app.post("/api/payment/webhook", 
  express.raw({ type: 'application/json' }), 
  async (req, res) => {
    try {
      const payload = JSON.parse(req.body.toString());
      const signature = req.headers['x-chapa-signature'];

      // Log webhook data for debugging
      console.log("Webhook received:", {
        signature: signature ? "Present" : "Missing",
        payload: payload
      });

      // For now, we'll trust the webhook since Chapa's signature verification
      // implementation details are not provided
      const { tx_ref, status } = payload;

      if (status === "success") {
        const courseId = tx_ref.split('-')[1];
        
        // Find the user who made the payment
        const user = await User.findOne({ 
          'subscription': { $in: [courseId] }
        });

        if (user) {
          console.log(`Webhook: Payment successful for ${tx_ref}, user: ${user._id}`);
          return res.status(200).send("Webhook processed successfully");
        } else {
          console.log(`Webhook: User not found for transaction ${tx_ref}`);
          return res.status(404).send("User not found");
        }
      }

      console.log(`Webhook: Payment not successful for ${tx_ref}`);
      res.status(400).send("Payment not successful");

    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(500).send("Error processing webhook");
    }
  }
);

// Import other routes
import userRoutes from "./routes/user.js";
import courseRoutes from "./routes/course.js";
import adminRoutes from "./routes/admin.js";
import assessmentRoutes from "./routes/assessmentRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import notificationRoutes from "./routes/notification.js";
// server/index.js
import userManagementRouter from './routes/userManagement.js';
app.use('/api/admin', userManagementRouter);

// Use other routes
app.use("/api", adminRoutes);
app.use("/api", courseRoutes);
app.use("/api", userRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/certificate", certificateRoutes);
app.use("/api", notificationRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use("/api", blogRoutes);
app.use('/api/chat', chatRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Chapa API Key: ${CHAPA_AUTH_KEY ? 'Loaded' : 'Missing!'}`);
  connectDb();
});