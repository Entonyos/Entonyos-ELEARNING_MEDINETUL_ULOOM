import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { server } from "../../config";
import toast from "react-hot-toast";
import { FaPlus, FaSave, FaTrash, FaEdit } from "react-icons/fa";
import "./createAssessment.css";

const CreateAssessment = () => {
  const { courseId } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState(60);
  const [passingScore, setPassingScore] = useState(70);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([
    {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    },
  ]);

  useEffect(() => {
    fetchAssessments();
  }, [courseId]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching assessments for course:', courseId);
      const response = await axios.get(`${server}/api/assessment/course/${courseId}`, {
        headers: {
          token: localStorage.getItem('token')
        }
      });
      console.log('API Response:', response.data);
      
      if (response.data.success && Array.isArray(response.data.assessments)) {
        setAssessments(response.data.assessments);
      } else {
        console.warn('Unexpected response format:', response.data);
        setAssessments([]);
      }
    } catch (err) {
      console.error('Error fetching assessments:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      setError(err.response?.data?.message || 'Failed to fetch assessments');
      toast.error(err.response?.data?.message || 'Failed to fetch assessments');
      setAssessments([]);
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
    
    setTitle(assessment.title || "");
    setDescription(assessment.description || "");
    setTimeLimit(assessment.timeLimit || 60);
    setPassingScore(assessment.passingScore || 70);
    setQuestions(assessment.questions || [{
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    }]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      },
    ]);
  };

  const removeQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    if (field === "options") {
      newQuestions[index].options = value;
    } else {
      newQuestions[index][field] = value;
    }
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting assessment:', {
        title,
        description,
        timeLimit,
        passingScore,
        questions
      });
      
      const response = await axios.post(
        `${server}/api/assessment/course/${courseId}`,
        {
          title,
          description,
          timeLimit,
          passingScore,
          questions,
        },
        {
          headers: {
            token: localStorage.getItem('token')
          }
        }
      );

      console.log('Create assessment response:', response.data);
      
      if (response.data.success) {
        toast.success('Assessment created successfully');
        // Reset form
        setTitle('');
        setDescription('');
        setTimeLimit(60);
        setPassingScore(70);
        setQuestions([
          {
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0,
          },
        ]);
        // Refresh the assessments list
        await fetchAssessments();
      }
    } catch (err) {
      console.error('Error creating assessment:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      toast.error(err.response?.data?.message || 'Failed to create assessment');
    }
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter assessment title"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
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
                  value={passingScore}
                  onChange={(e) => setPassingScore(Number(e.target.value))}
                  min="0"
                  max="100"
                  required
                />
              </div>
            </div>
          </div>

          <div className="questions">
            <h3>Questions</h3>
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="question">
                <div className="d-flex justify-content-between align-items-center">
                  <h4>Question {qIndex + 1}</h4>
                  {questions.length > 1 && (
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
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button 
              className="btn btn-primary" 
              onClick={fetchAssessments}
            >
              Retry
            </button>
          </div>
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