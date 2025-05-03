import React, { useEffect, useState } from "react";
import "./coursedescription.css";
import { useNavigate, useParams } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";
import { server } from "../../config";
import axios from "axios";
import toast from "react-hot-toast";
import { UserData } from "../../context/UserContext";
import Loading from "../../components/Loading";

const CourseDescription = ({ user }) => {
  const params = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { fetchUser } = UserData();
  const { fetchCourse, course, fetchCourses, fetchMyCourse } = CourseData();

  useEffect(() => {
    if (params.id) {
      fetchCourse(params.id);
    }
  }, [params.id, fetchCourse]);  

  const checkoutHandler = async () => {
    if (!user || !course) {
      toast.error("Please wait while we load the course details");
      return;
    }

    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token); // Debug log
    
    if (!token) {
      toast.error("Please login to continue");
      navigate('/login');
      return;
    }

    setLoading(true);
  
    try {
      // Generate unique transaction reference
      const tx_ref = `course-${params.id}-${Date.now()}`;
      
      // Initialize Chapa payment
      const { data } = await axios.post(
        `${server}/api/payment/initialize`,        
        {          
          amount: course.price,
          email: user.email,
          courseId: params.id,
          userId: user._id,
          courseTitle: course.title
        },
        { 
          headers: { 
            "token": token,
            "Content-Type": "application/json"
          } 
        }
      );
  
      if (data.success && data.checkoutUrl) {
        // Redirect to Chapa checkout page
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.message || "Failed to initialize payment");
      }
  
    } catch (error) {
      console.error("Payment error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.config?.headers
      });
      
      if (error.response?.status === 401) {
        toast.error("Your session has expired. Please login again.");
        localStorage.removeItem("token"); // Clear invalid token
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || "Payment initialization failed");
      }
      setLoading(false);
    }
  };

  if (!course) {
    return <Loading />;
  }

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          {course && (
            <div className="course-description" style={{
              maxWidth: '650px',
              margin: '25px auto',
              padding: '20px',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
              animation: 'fadeIn 0.5s ease-out'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div style={{
                  position: 'relative',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                  height: '220px'
                }}>
                  <img
                    src={`${server}/uploads/lectures/${course.image}`}
                    alt={course.title}
                    className="course-image"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                  />
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '220px'
                }}>
                  <div>
                    <h2 style={{
                      fontSize: '21px',
                      color: '#1a1a1a',
                      marginBottom: '10px',
                      fontWeight: '600',
                      lineHeight: '1.3'
                    }}>{course.title}</h2>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#4b5563',
                        fontSize: '13px'
                      }}>
                        <span style={{ fontSize: '15px' }}>👨‍🏫</span>
                        <p style={{ margin: 0 }}>Instructor: {course.createdBy}</p>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#4b5563',
                        fontSize: '13px'
                      }}>
                        <span style={{ fontSize: '15px' }}>⏱️</span>
                        <p style={{ margin: 0 }}>Duration: {course.duration} weeks</p>
                      </div>
                    </div>

                    <div style={{
                      padding: '10px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '4px',
                      marginBottom: '12px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <p style={{
                        fontSize: '15px',
                        color: '#1a1a1a',
                        fontWeight: '500',
                        margin: 0
                      }}>Price: ETB{course.price}</p>
                    </div>
                  </div>

                  {user && user.subscription && user.subscription.includes(course._id) ? (
                    <button
                      onClick={() => navigate(`/course/study/${course._id}`)}
                      className="common-btn"
                      style={{
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontWeight: '500',
                        backgroundColor: '#1a1a1a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        width: '100%',
                        ':hover': {
                          backgroundColor: '#333333',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      Start Learning
                    </button>
                  ) : (
                    <button 
                      onClick={checkoutHandler} 
                      className="common-btn"
                      disabled={loading}
                      style={{
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontWeight: '500',
                        backgroundColor: '#1a1a1a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        width: '100%',
                        opacity: loading ? 0.7 : 1,
                        ':hover': {
                          backgroundColor: 'var(--secondary-color: #0f766e)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      {loading ? "Processing..." : "Enroll Now"}
                    </button>
                  )}
                </div>
              </div>

              <div style={{
                borderTop: '1px solid #e5e7eb',
                paddingTop: '15px'
              }}>
                <h3 style={{
                  fontSize: '17px',
                  color: '#1a1a1a',
                  marginBottom: '10px',
                  fontWeight: '500'
                }}>Course Description</h3>
                <p style={{
                  color: '#4b5563',
                  lineHeight: '1.5',
                  fontSize: '13px'
                }}>{course.description}</p>
              </div>
            </div>
          )}
        </>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .course-image:hover {
            transform: scale(1.02);
          }
        `}
      </style>
    </>
  );
};

export default CourseDescription;