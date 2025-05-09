import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../config";
import toast from "react-hot-toast";
import { FaPlus, FaSave, FaTrash, FaEdit } from "react-icons/fa";
import "./createAssessment.css";

const CreateAssessment = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [assessments, setAssessments] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    timeLimit: 30,
    passingScore: 60,
    questions: [
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      },
    ],
  });

  useEffect(() => {
    if (!courseId) {
      toast.error("Course ID is missing");
      navigate("/courses");
      return;
    }
    fetchAssessments();
  }, [courseId]);

  const fetchAssessments = async () => {
    try {
      const { data } = await axios.get(
        `${server}/api/assessment/course/${courseId}`,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      
      if (data.success) {
        setAssessments(data.assessments || []);
      } else {
        toast.error(data.message || "Failed to fetch assessments");
        setAssessments([]);
      }
    } catch (error) {
      console.error("Error fetching assessments:", error);
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      toast.error(error.response?.data?.message || "Failed to fetch assessments");
      setAssessments([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!courseId) {
        throw new Error("Course ID is missing");
      }

      const { data } = await axios.post(
        `${server}/api/assessment/course/${courseId}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        }
      );

      toast.success("Assessment created successfully");
      navigate(`/course/${courseId}`);
    } catch (error) {
      console.error("Error creating assessment:", error);
      console.error("Error details:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to create assessment");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assessmentId) => {
    if (window.confirm("Are you sure you want to delete this assessment?")) {
      try {
        console.log('Deleting assessment:', assessmentId);
        const response = await axios.delete(
          `${server}/api/assessment/${assessmentId}`,
          {
            headers: {
              token: localStorage.getItem("token"),
            },
          }
        );
        
        console.log('Delete response:', response.data);
        
        if (response.data.success) {
          toast.success("Assessment deleted successfully");
          // Refresh the list
          await fetchAssessments();
        } else {
          toast.error(response.data.message || "Failed to delete assessment");
        }
      } catch (err) {
        console.error('Error deleting assessment:', err);
        console.error('Error details:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        });
        toast.error(err.response?.data?.message || "Failed to delete assessment");
      }
    }
  };

  const handleEdit = (assessment) => {
    if (!assessment) return;
    
    setFormData({
      title: assessment.title || "",
      description: assessment.description || "",
      timeLimit: assessment.timeLimit || 30,
      passingScore: assessment.passingScore || 60,
      questions: assessment.questions || [{
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      }],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
        },
      ],
    });
  };

  const removeQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      questions: newQuestions,
    });
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...formData.questions];
    if (field === "options") {
      newQuestions[index].options = value;
    } else {
      newQuestions[index][field] = value;
    }
    setFormData({
      ...formData,
      questions: newQuestions,
    });
  };

  return (
    <div className="assessment-container">
      <div className="create-assessment">
        <h2>Create Assessment</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Enter assessment title"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              placeholder="Enter assessment description"
              rows="3"
            />
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">Time Limit (minutes)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData({ ...formData, timeLimit: Number(e.target.value) })}
                  min="1"
                  required
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">Passing Score (%)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.passingScore}
                  onChange={(e) => setFormData({ ...formData, passingScore: Number(e.target.value) })}
                  min="0"
                  max="100"
                  required
                />
              </div>
            </div>
          </div>

          <div className="questions">
            <h3>Questions</h3>
            {formData.questions.map((q, qIndex) => (
              <div key={qIndex} className="question">
                <div className="d-flex justify-content-between align-items-center">
                  <h4>Question {qIndex + 1}</h4>
                  {formData.questions.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeQuestion(qIndex)}
                    >
                      <FaTrash /> Remove
                    </button>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Question Text</label>
                  <input
                    type="text"
                    className="form-control"
                    value={q.question}
                    onChange={(e) =>
                      updateQuestion(qIndex, "question", e.target.value)
                    }
                    required
                    placeholder="Enter your question"
                  />
                </div>

                {q.options.map((option, oIndex) => (
                  <div key={oIndex} className="option-input">
                    <input
                      type="text"
                      className="form-control"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...q.options];
                        newOptions[oIndex] = e.target.value;
                        updateQuestion(qIndex, "options", newOptions);
                      }}
                      required
                      placeholder={`Option ${oIndex + 1}`}
                    />
                    <div className="form-check">
                      <input
                        type="radio"
                        className="form-check-input"
                        name={`correct-${qIndex}`}
                        checked={q.correctAnswer === oIndex}
                        onChange={() =>
                          updateQuestion(qIndex, "correctAnswer", oIndex)
                        }
                      />
                      <label className="form-check-label">Correct Answer</label>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="d-flex">
            <button
              type="button"
              className="btn btn-primary"
              onClick={addQuestion}
            >
              <FaPlus /> Add Question
            </button>
            <button type="submit" className="btn btn-success">
              <FaSave /> Create Assessment
            </button>
          </div>
        </form>
      </div>

      <div className="assessment-list">
        <h3>Created Assessments</h3>
        {loading ? (
          <div className="loading-spinner" />
        ) : !Array.isArray(assessments) || assessments.length === 0 ? (
          <div className="no-assessments">
            <p>No assessments created yet</p>
            <p className="text-muted">Create your first assessment to get started</p>
          </div>
        ) : (
          assessments.map((assessment) => (
            <div key={assessment._id} className="assessment-item">
              <h4 className="assessment-title">{assessment.title}</h4>
              <div className="assessment-meta">
                <span>
                  <i className="fas fa-clock"></i>
                  {assessment.timeLimit} minutes
                </span>
                <span>
                  <i className="fas fa-percent"></i>
                  {assessment.passingScore}% passing score
                </span>
                <span>
                  <i className="fas fa-question-circle"></i>
                  {assessment.questions?.length || 0} questions
                </span>
              </div>
              <div className="assessment-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => handleEdit(assessment)}
                >
                  <i className="fas fa-edit"></i> Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(assessment._id)}
                >
                  <i className="fas fa-trash"></i> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CreateAssessment; 