import React from "react";
import { MdDashboard, MdAccountCircle, MdSettings, MdLibraryBooks } from "react-icons/md";
import { IoMdLogOut } from "react-icons/io";
import { UserData } from "../../context/UserContext";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import "./account.css";
import { server } from "../../config";

const Account = ({ user }) => {
  const { setIsAuth, setUser } = UserData();
  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.clear();
    setUser([]);
    setIsAuth(false);
    toast.success("Logged Out");
    navigate("/login");
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
                        <img 
                          src={`${server}/uploads/profiles/${user.image}`}
                          alt={user.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = null;
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="avatar-fallback"><MdAccountCircle size={80} color="#757575" /></div>';
                          }}
                        />
                      ) : (
                        <MdAccountCircle 
                          size={80} 
                          color="#757575"
                        />
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
        </div>
      )}
    </div>
  );
};

export default Account;