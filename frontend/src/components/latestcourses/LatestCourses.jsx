import React, { useEffect, useState, useRef } from 'react';
import { server } from '../../config';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './latestcourses.css';
import StarRating from '../coursecard/StarRating';
import { UserData } from '../../context/UserContext';
import toast from 'react-hot-toast';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const LatestCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const coursesContainerRef = useRef(null);
  const { isAuth } = UserData();

  const coursesPerPage = 4; // Number of courses to show at once

  useEffect(() => {
    fetchLatestCourses();
  }, []);

  const fetchLatestCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${server}/api/course/all`);
      
      if (response.data && response.data.courses && Array.isArray(response.data.courses)) {
        const sortedCourses = response.data.courses
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 8);
        setCourses(sortedCourses);
      } else {
        setError('Failed to load courses');
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError('Failed to load courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = async (courseId, newRating) => {
    if (!isAuth) return;

    try {
      const { data } = await axios.post(
        `${server}/api/course/${courseId}/rate`,
        { rating: newRating },
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course._id === courseId 
            ? { ...course, rating: data.rating, ratingCount: data.ratingCount }
            : course
        )
      );
      
      toast.success("Rating updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update rating");
    }
  };

  const handleImageError = (e) => {
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjNjY2Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
    e.target.onerror = null;
  };

  const getImageUrl = (imageName) => {
    if (!imageName) return null;
    return `${server}/uploads/lectures/${imageName}`;
  };

  const nextSlide = () => {
    if (currentIndex < courses.length - coursesPerPage) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <section className="latest-courses">
        <h2>Latest Courses</h2>
        <div className="loading">Loading courses...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="latest-courses">
        <h2>Latest Courses</h2>
        <div className="error">{error}</div>
      </section>
    );
  }

  return (
    <section className="latest-courses">
      <h2>Latest Courses</h2>
      {courses.length === 0 ? (
        <div className="no-courses">No courses available at the moment.</div>
      ) : (
        <div className="courses-carousel">
          <button 
            className="carousel-button prev"
            onClick={prevSlide}
            disabled={currentIndex === 0}
          >
            <FaChevronLeft />
          </button>
          
          <div className="courses-container" ref={coursesContainerRef}>
            <div 
              className="courses-slider"
              style={{ transform: `translateX(-${currentIndex * (100 / coursesPerPage)}%)` }}
            >
              {courses.map((course) => (
                <div className="course-card" key={course._id}>
                  <div className="course-image">
                    <img 
                      src={getImageUrl(course.image)}
                      alt={course.title}
                      onError={handleImageError}
                      loading="lazy"
                    />
                  </div>
                  <div className="course-info">
                    <h3>{course.title}</h3>
                    <p className="instructor">Instructor: {course.createdBy}</p>
                    <p className="duration">Duration: {course.duration} weeks</p>
                    <p className="price">Price: ETB{course.price}</p>
                    <StarRating 
                      initialRating={course.rating || 0} 
                      onRatingChange={(rating) => handleRatingChange(course._id, rating)}
                      ratingCount={course.ratingCount || 0}
                      showTooltip={true}
                    />
                    <Link to={`/course/${course._id}`} className="view-course">
                      View Course
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            className="carousel-button next"
            onClick={nextSlide}
            disabled={currentIndex >= courses.length - coursesPerPage}
          >
            <FaChevronRight />
          </button>
        </div>
      )}
    </section>
  );
};

export default LatestCourses; 