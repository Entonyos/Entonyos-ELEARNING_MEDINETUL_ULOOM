import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../config";
import Layout from "../Utils/Layout";
import toast from "react-hot-toast";
import { FaUserCog, FaSyncAlt, FaEye } from "react-icons/fa";
import "./users.css";

const AdminUsers = ({ user }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  if (user && user.mainrole !== "superadmin") return navigate("/");

  async function fetchUsers() {
    setLoading(true);
    try {
      const { data } = await axios.get(`${server}/api/users`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateRole = async (id) => {
    if (window.confirm("Are you sure you want to update this user's role?")) {
      try {
        const { data } = await axios.put(
          `${server}/api/user/${id}`,
          {},
          {
            headers: {
              token: localStorage.getItem("token"),
            },
          }
        );
        toast.success(data.message);
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || "Update failed");
      }
    }
  };

  const UserDetailsModal = ({ user, onClose }) => {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>User Details</h3>
            <button onClick={onClose} className="close-button">&times;</button>
          </div>
          <div className="modal-body">
            <div className="user-info">
              <h4>Basic Information</h4>
              <p><strong>Name:</strong> {user?.name || 'N/A'}</p>
              <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
              <p><strong>Role:</strong> {user?.role || 'N/A'}</p>
              <p><strong>Registered:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
            
            <div className="subscription-info">
              <h4>Subscribed Courses</h4>
              {user?.subscription && user.subscription.length > 0 ? (
                <div className="subscription-list">
                  {user.subscription.map((course, index) => (
                    <div key={course._id || index} className="subscription-item">
                      <p><strong>Course:</strong> {course.title || 'N/A'}</p>
                      <p><strong>Category:</strong> {course.category || 'N/A'}</p>
                      <p><strong>Duration:</strong> {course.duration || 'N/A'} hours</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No courses subscribed</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="container-fluid py-4" style={{ paddingLeft: '0', paddingRight: '0' }}>
        <div className="card shadow" style={{
          marginLeft: 'auto',
          width: '95%',
          maxWidth: 'none',
          marginRight: '5px'
        }}>
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h3 className="mb-0">
              <FaUserCog className="me-2" />
              User Management
            </h3>
            <button 
              onClick={fetchUsers} 
              className="btn btn-light btn-sm"
              disabled={loading}
            >
              <FaSyncAlt className={loading ? "fa-spin" : ""} />
            </button>
          </div>
          <div className="card-body" style={{ padding: '1.5rem' }}>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover" style={{ minWidth: '1000px' }}>
                  <thead className="table-dark">
                    <tr>
                      <th scope="col" style={{ width: '5%' }}>#</th>
                      <th scope="col" style={{ width: '20%' }}>Name</th>
                      <th scope="col" style={{ width: '25%' }}>Email</th>
                      <th scope="col" style={{ width: '15%' }}>Role</th>
                      <th scope="col" style={{ width: '15%' }}>Registered Date</th>
                      <th scope="col" style={{ width: '10%' }}>Subscribed Courses</th>
                      <th scope="col" style={{ width: '10%' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users && users.length > 0 ? (
                      users.map((user, index) => (
                        <tr key={user?._id || index}>
                          <th scope="row">{index + 1}</th>
                          <td>{user?.name || 'N/A'}</td>
                          <td>{user?.email || 'N/A'}</td>
                          <td>
                            <span className={`badge ${
                              user?.role === 'admin' ? 'bg-success' : 
                              user?.role === 'user' ? 'bg-info' : 'bg-secondary'
                            }`}>
                              {user?.role || 'N/A'}
                            </span>
                          </td>
                          <td>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                          <td>{user?.subscription?.length || 0}</td>
                          <td>
                            <div className="btn-group">
                              <button
                                onClick={() => setSelectedUser(user)}
                                className="btn btn-info btn-sm me-2"
                                title="View Details"
                              >
                                <FaEye />
                              </button>
                              <button
                                onClick={() => updateRole(user?._id)}
                                className="btn btn-warning btn-sm"
                                title="Update Role"
                              >
                                Update Role
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </Layout>
  );
};

export default AdminUsers;