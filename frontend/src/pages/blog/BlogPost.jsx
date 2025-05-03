import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { server } from '../../config';
import axios from 'axios';
import './blogpost.css';

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlogPost();
  }, [id]);

  const fetchBlogPost = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${server}/api/blog/${id}`);
      
      if (response.data && response.data.post) {
        setPost(response.data.post);
      } else {
        setError('Failed to load blog post');
      }
    } catch (error) {
      console.error("Error fetching blog post:", error);
      setError('Failed to load blog post. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleImageError = (e) => {
    e.target.src = '/images/placeholder.jpg';
    e.target.onerror = null; // Prevent infinite loop
  };

  const getImageUrl = (imageName) => {
    if (!imageName) return '/images/placeholder.jpg';
    return `${server}/uploads/blog/${imageName}`;
  };

  if (loading) {
    return (
      <div className="blog-post-container">
        <div className="loading">Loading blog post...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-post-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="blog-post-container">
        <div className="error">Blog post not found</div>
      </div>
    );
  }

  return (
    <div className="blog-post-container">
      <article className="blog-post">
        <div className="blog-post-header">
          <h1>{post.title}</h1>
          <div className="blog-post-meta">
            <span className="author">By {post.author}</span>
            <span className="date">{formatDate(post.createdAt)}</span>
          </div>
        </div>
        <div className="blog-post-image">
          <img 
            src={getImageUrl(post.image)}
            alt={post.title}
            onError={handleImageError}
            loading="lazy"
            width="800"
            height="400"
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div className="blog-post-content">
          {post.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  );
};

export default BlogPost; 