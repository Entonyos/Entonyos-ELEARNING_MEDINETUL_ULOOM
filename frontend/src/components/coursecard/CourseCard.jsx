import React, { useState } from "react";
import "./courseCard.css";
import { server } from "../../config";
import { UserData } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { CourseData } from "../../context/CourseContext";
import StarRating from "./StarRating";

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const { user, isAuth } = UserData();
  const { fetchCourses } = CourseData();
  const [rating, setRating] = useState(course.rating || 0);

  const handleRatingChange = async (newRating) => {
    if (!isAuth) {
      return; // Silently return if user is not authenticated
    }

    try {
      const { data } = await axios.post(
        `${server}/api/course/${course._id}/rate`,
        { rating: newRating },
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      setRating(newRating);
      toast.success("Rating updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update rating");
    }
  };

  const deleteHandler = async (id) => {
    if (confirm("Are you sure you want to delete this course")) {
      try {
        const { data } = await axios.delete(`${server}/api/course/${id}`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });

        toast.success(data.message);
        fetchCourses();
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
  };

  return (
    <div className="course-card">
      <img src={`${server}/uploads/lectures/${course.image}`} alt="" className="course-image" />
      <h3>{course.title}</h3>
      <p>Instructor- {course.createdBy}</p>
      <p>Duration- {course.duration} weeks</p>
      <p>Price- ${course.price}</p>
      <StarRating 
        initialRating={rating} 
        onRatingChange={handleRatingChange}
        ratingCount={course.ratingCount || 0}
        showTooltip={true}
      />
      {isAuth ? (
        <>
          {user && user.role !== "admin" ? (
            <>
              {user.subscription.includes(course._id) ? (
                <button
                  onClick={() => navigate(`/course/study/${course._id}`)}
                  className="common-btn"
                >
                  Study
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/course/${course._id}`)}
                  className="common-btn"
                >
                  Get Started
                </button>
              )}
            </>
          ) : (
            <div className="admin-buttons">
              <button
                onClick={() => navigate(`/course/study/${course._id}`)}
                className="common-btn"
              >
                Study
              </button>
              <button
                onClick={() => navigate(`/admin/course/edit/${course._id}`)}
                className="common-btn edit-btn"
              >
                Edit
              </button>
              <button
                onClick={() => deleteHandler(course._id)}
                className="common-btn delete-btn"
              >
                Delete
              </button>
            </div>
          )}
        </>
      ) : (
        <button onClick={() => navigate("/login")} className="common-btn">
          Get Started
        </button>
      )}
    </div>
  );
};

export default CourseCard;
