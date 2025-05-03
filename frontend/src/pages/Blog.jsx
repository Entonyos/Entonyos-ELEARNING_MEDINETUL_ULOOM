import React from 'react';
import BlogSection from '../components/blog/BlogSection';
import './Blog.css';

const Blog = () => {
  return (
    <div className="blog-page">
      <div className="blog-page-header">
        <h1>Our Blog</h1>
        <p>Stay updated with our latest news and articles</p>
      </div>
      <BlogSection />
    </div>
  );
};

export default Blog; 