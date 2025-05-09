import React, { useState } from "react";
import "./header.css";
import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import { MdAccountCircle } from "react-icons/md";
import { UserData } from "../../context/UserContext";
import { server } from "../../config";
import Notification from "../Notification";

const Header = ({ isAuth }) => {
  const { user } = UserData();
  const [showTooltip, setShowTooltip] = useState(false);
  const isAdmin = user?.role === "admin";

  return (
    <header className="main-header">
      <div className="header-content">
        <div className="logo">
          <Link to="/" className="logo-link">
            <img
              src="logo3.png"
              alt="Medinatul Uloom Logo"
              className="img-fluid"
            />
          </Link>
        </div>

        <nav className="main-nav">
          {!isAdmin && (
            <>
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/courses" className="nav-link">Courses</Link>
              <Link to="/about" className="nav-link">About</Link>
              <Link to="/blog" className="nav-link">Blog</Link>
            </>
          )}
          
          {isAuth ? (
            <Link 
              to="/account" 
              className="nav-link profile-link"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <Link to="/blog" className="nav-link">Blog</Link>
              <div className="header-avatar">
                {user?.image ? (
                  <img 
                    src={`${server}/uploads/profiles/${user.image}`}
                    alt={user.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = null;
                      e.target.style.display = 'none';
                      const parent = e.target.parentElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = 'avatar-fallback';
                        fallback.innerHTML = '<svg viewBox="0 0 24 24" width="32" height="32"><path fill="#757575" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>';
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <MdAccountCircle 
                    size={32} 
                    color="#757575"
                  />
                )}
              </div>
              {showTooltip && (
                <div className="profile-tooltip">
                  {user?.name || "User"}
                  <div className="tooltip-arrow"></div>
                </div>
              )}
            </Link>
          ) : (
            <Link to="/login" className="nav-link">Login</Link>
          )}
          {user && <Notification user={user} />}
        </nav>
      </div>
    </header>
  );
};

export default Header;
