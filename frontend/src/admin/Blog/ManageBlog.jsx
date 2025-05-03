import React, { useState, useEffect } from 'react';
import { server } from '../../config';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './manageblog.css';

const ManageBlog = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    author: '',
    image: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${server}/api/blog/recent`);
      
      if (response.data && response.data.posts) {
        setPosts(response.data.posts);
      } else {
        setError('Failed to load blog posts');
      }
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      setError('Failed to load blog posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    setFormData(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      const headers = {
        token: localStorage.getItem("token"),
      };

      if (isEditing) {
        await axios.put(
          `${server}/api/blog/${editingId}`,
          formDataToSend,
          { headers }
        );
        toast.success("Blog post updated successfully");
      } else {
        await axios.post(
          `${server}/api/blog`,
          formDataToSend,
          { headers }
        );
        toast.success("Blog post created successfully");
      }

      setFormData({
        title: '',
        summary: '',
        content: '',
        author: '',
        image: null
      });
      setIsEditing(false);
      setEditingId(null);
      fetchPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save blog post");
    }
  };

  const handleEdit = (post) => {
    setFormData({
      title: post.title,
      summary: post.summary,
      content: post.content,
      author: post.author,
      image: null
    });
    setIsEditing(true);
    setEditingId(post._id);
    document.querySelector('.blog-form').scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      try {
        await axios.delete(`${server}/api/blog/${id}`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });
        toast.success("Blog post deleted successfully");
        fetchPosts();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete blog post");
      }
    }
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
    return <div className="loading">Loading blog posts...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="manage-blog">
      <h2>{isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}</h2>
      
      <form onSubmit={handleSubmit} className="blog-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="summary">Summary</label>
          <textarea
            id="summary"
            name="summary"
            value={formData.summary}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            required
            rows="10"
          />
        </div>

        <div className="form-group">
          <label htmlFor="author">Author</label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Image</label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleImageChange}
            accept="image/*"
            required={!isEditing}
          />
          {isEditing && (
            <p className="image-note">Leave empty to keep existing image</p>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            {isEditing ? 'Update Post' : 'Create Post'}
          </button>
          {isEditing && (
            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                setIsEditing(false);
                setEditingId(null);
                setFormData({
                  title: '',
                  summary: '',
                  content: '',
                  author: '',
                  image: null
                });
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="blog-posts">
        <h3>Existing Blog Posts</h3>
        <div className="posts-grid">
          {posts.map(post => (
            <div key={post._id} className="post-card">
              <img
                src={getImageUrl(post.image)}
                alt={post.title}
                onError={handleImageError}
                loading="lazy"
                width="300"
                height="200"
                style={{ objectFit: 'cover' }}
              />
              <div className="post-info">
                <h4>{post.title}</h4>
                <p>{post.summary}</p>
                <div className="post-actions">
                  <button
                    onClick={() => handleEdit(post)}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageBlog; 