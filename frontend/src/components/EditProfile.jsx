import React, { useState } from 'react';
import axios from 'axios';
import { server } from '../config';
import toast from 'react-hot-toast';
import { MdAccountCircle } from 'react-icons/md';
import './EditProfile.css';
import path from 'path';
import fs from 'fs';

const EditProfile = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.image ? `${server}/uploads/profiles/${user.image}` : '');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      if (image) {
        formDataToSend.append('image', image);
      }

      const { data } = await axios.put(
        `${server}/api/profile/update`,
        formDataToSend,
        {
          headers: {
            token: localStorage.getItem('token'),
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success(data.message || "Profile updated successfully");
      onUpdate(data.user);
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit} className="edit-profile-form">
        <div className="form-group">
          <label>Profile Picture</label>
          <div className="image-upload-container">
            <div className="current-image">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Profile preview" 
                  className="profile-preview"
                />
              ) : (
                <MdAccountCircle size={100} color="#757575" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="image-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            disabled
            className="disabled-input"
          />
          <small>Email cannot be changed</small>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default EditProfile; 