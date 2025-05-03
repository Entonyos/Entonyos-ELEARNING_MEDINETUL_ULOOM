import React, { useEffect, useState, useRef } from 'react';
import { server } from '../../config';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './blog.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const BlogSection = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const autoScrollInterval = useRef(null);
  const transitionTimeout = useRef(null);

  useEffect(() => {
    fetchBlogPosts();
    return () => {
      clearInterval(autoScrollInterval.current);
      clearTimeout(transitionTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (allPosts.length > 0) {
      setCurrentPost(allPosts[currentIndex]);
      startAutoScroll();
    }
    return () => {
      clearInterval(autoScrollInterval.current);
      clearTimeout(transitionTimeout.current);
    };
  }, [currentIndex, allPosts]);

  const startAutoScroll = () => {
    clearInterval(autoScrollInterval.current);
    autoScrollInterval.current = setInterval(() => {
      scrollRight();
    }, 5000);
  };

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${server}/api/blog/recent`);
      
      if (response.data && response.data.posts && Array.isArray(response.data.posts)) {
        setAllPosts(response.data.posts);
        setCurrentPost(response.data.posts[0]);
      } else {
        console.error('Invalid response format:', response.data);
        setError('Failed to load blog posts');
      }
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      setError('Failed to load blog posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const scrollLeft = () => {
    if (currentIndex > 0) {
      setTransitioning(true);
      setCurrentIndex(prev => prev - 1);
      transitionTimeout.current = setTimeout(() => {
        setTransitioning(false);
      }, 500);
    }
  };

  const scrollRight = () => {
    setTransitioning(true);
    if (currentIndex < allPosts.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
    transitionTimeout.current = setTimeout(() => {
      setTransitioning(false);
    }, 500);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isNewPost = (dateString) => {
    const postDate = new Date(dateString);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - postDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 2;
  };

  const handleImageError = (e) => {
    e.target.src = '/images/placeholder.jpg';
    e.target.onerror = null;
  };

  const getImageUrl = (imageName) => {
    if (!imageName) return '/images/placeholder.jpg';
    return `${server}/uploads/blog/${imageName}`;
  };

  if (loading) {
    return (
      <div className="blog-loading">
        <div className="loading-spinner"></div>
        <p>Loading blog posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="blog-container">
      <div className="blog-scroll-container">
        <button 
          className={`scroll-button left ${currentIndex === 0 ? 'disabled' : ''}`} 
          onClick={scrollLeft}
          disabled={currentIndex === 0}
        >
          <FaChevronLeft />
        </button>
        <div className="blog-grid">
          {currentPost && (
            <article 
              key={currentPost._id} 
              className={`blog-card ${transitioning ? 'transitioning' : ''}`}
            >
              <Link to={`/blog/${currentPost._id}`} className="blog-link">
                <div className="blog-image-wrapper">
                  <img
                    src={getImageUrl(currentPost.image)}
                    alt={currentPost.title}
                    className="blog-image"
                    onError={handleImageError}
                    loading="lazy"
                  />
                  {isNewPost(currentPost.createdAt) && (
                    <div className="new-badge">New</div>
                  )}
                </div>
                <div className="blog-content">
                  <div className="blog-meta">
                    <span className="blog-date">{formatDate(currentPost.createdAt)}</span>
                    <span className="blog-author">By {currentPost.author}</span>
                  </div>
                  <h3 className="blog-title">{currentPost.title}</h3>
                  <p className="blog-excerpt">{currentPost.content.substring(0, 150)}...</p>
                  <div className="blog-read-more">
                    Read More
                    <svg className="arrow-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </Link>
            </article>
          )}
        </div>
        <button 
          className="scroll-button right" 
          onClick={scrollRight}
        >
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

export default BlogSection; 