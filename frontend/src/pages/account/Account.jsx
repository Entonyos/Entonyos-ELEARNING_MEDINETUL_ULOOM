import React, { useState } from "react";
import { MdDashboard, MdAccountCircle, MdSettings, MdLibraryBooks, MdEdit } from "react-icons/md";
import { IoMdLogOut } from "react-icons/io";
import { UserData } from "../../context/UserContext";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import "./account.css";
import { server } from "../../config";
import EditProfile from '../../components/EditProfile';

const Account = ({ user }) => {
  const { setIsAuth, setUser } = UserData();
  const navigate = useNavigate();
  const [showEditProfile, setShowEditProfile] = useState(false);

  const logoutHandler = () => {
    localStorage.clear();
    setUser([]);
    setIsAuth(false);
    toast.success("Logged Out");
    navigate("/login");
  };

  const handleProfileUpdate = (updatedUser) => {
    // Update the user context with the new user data
    setUser(updatedUser);
  };

  return (
    <div className="account-page">
      {user && (
        <div className="container">
          <div className="row justify-content-end">
            <div className="col-lg-4 col-md-6">
              <div className="account-card">
                {/* Profile Header */}
                <div className="profile-header">
                  <div className="avatar-container">
                    <div className="avatar-image">
                      {user?.image ? (
                        <div className="image-wrapper">
                        <img 
                          src={`${server}/uploads/profiles/${user.image}`}
                          alt={user.name}
                          onError={(e) => {
                            e.target.style.display = 'none';
                              const fallback = document.createElement('div');
                              fallback.className = 'avatar-fallback';
                              fallback.innerHTML = '<svg viewBox="0 0 24 24" width="80" height="80"><path fill="#757575" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>';
                              e.target.parentElement.appendChild(fallback);
                            }}
                          />
                        </div>
                      ) : (
                        <div className="avatar-fallback">
                          <MdAccountCircle size={80} color="#757575" />
                        </div>
                      )}
                    </div>
                  </div>
                  <h4 className="profile-name">{user.name}</h4>
                  <p className="profile-email">{user.email}</p>
                </div>

                {/* Profile Options */}
                <div className="profile-options">
                {user.role === "user" && (
                  <Link 
                    to={"/dashboard"}
                    className="profile-option"
                  >
                    <MdLibraryBooks className="option-icon" />
                    <span>My Courses</span>
                  </Link>
                )}

                  {user.role === "admin" && (
                    <Link 
                      to="/admin/dashboard"
                      className="profile-option"
                    >
                      <MdSettings className="option-icon" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <Link 
                    to="#"
                    className="profile-option"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowEditProfile(true);
                    }}
                  >
                    <MdEdit className="option-icon" />
                    <span>Edit Profile</span>
                  </Link>

                  <button
                    onClick={logoutHandler}
                    className="profile-option logout-btn"
                  >
                    <IoMdLogOut className="option-icon" />
                    <span>Sign Out</span>
                  </button>
                </div>

                {/* Subscription Info */}
                {user.role !== "admin" && user.subscription && user.subscription.length > 0 && (
                  <div className="subscription-info">
                    {/* <h6 className="subscription-title">Enrolled Courses</h6>
                    <div className="enrolled-courses">
                      {user.subscription.map((courseId) => (
                        <Link 
                          key={courseId}
                          to={`/course/${courseId}/certificate`}
                          className="enrolled-course"
                        >
                          <span className="course-name">Course #{courseId}</span>
                          <small className="view-certificate">View Certificate</small>
                        </Link>
                      ))}
                    </div> */}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Edit Profile Modal */}
          {showEditProfile && (
            <div className="modal-overlay">
              <div className="modal-content">
                <button 
                  className="close-button"
                  onClick={() => setShowEditProfile(false)}
                >
                  ×
                </button>
                <EditProfile 
                  user={user} 
                  onUpdate={handleProfileUpdate}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Account;