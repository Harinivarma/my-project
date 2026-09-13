import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { Shield, Users, BookOpen, CreditCard, PieChart, LogOut, Check, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('STATS'); // STATS, USERS, COURSES, ORDERS
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalInstructors: 0,
    totalCourses: 0,
    approvedCourses: 0,
    pendingCourses: 0,
    totalRevenue: 0
  });
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/login');
      return;
    }
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'STATS') {
        const statsRes = await api.get('/admin/statistics');
        setStats(statsRes.data);
      } else if (activeTab === 'USERS') {
        const usersRes = await api.get('/admin/users');
        setUsers(usersRes.data);
      } else if (activeTab === 'COURSES') {
        const coursesRes = await api.get('/admin/courses');
        setCourses(coursesRes.data);
      } else if (activeTab === 'ORDERS') {
        const ordersRes = await api.get('/admin/orders');
        setOrders(ordersRes.data);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to retrieve admin details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCourse = async (courseId) => {
    try {
      await api.post(`/admin/courses/${courseId}/approve`);
      alert('Course approved successfully!');
      fetchAdminData();
    } catch (e) {
      alert('Failed to approve course.');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to remove this course?')) return;
    try {
      await api.delete(`/admin/courses/${courseId}`);
      fetchAdminData();
    } catch (e) {
      alert('Failed to delete course.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this user account?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchAdminData();
    } catch (e) {
      alert('Failed to remove user account.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', padding: '0 8px' }}>
          <Shield size={24} color="var(--primary)" />
          <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>Admin Controls</span>
        </div>

        <button onClick={() => setActiveTab('STATS')} className={`sidebar-link ${activeTab === 'STATS' ? 'active' : ''}`} style={{ background: 'transparent', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
          <PieChart size={18} /> Platform Statistics
        </button>
        <button onClick={() => setActiveTab('USERS')} className={`sidebar-link ${activeTab === 'USERS' ? 'active' : ''}`} style={{ background: 'transparent', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
          <Users size={18} /> User Management
        </button>
        <button onClick={() => setActiveTab('COURSES')} className={`sidebar-link ${activeTab === 'COURSES' ? 'active' : ''}`} style={{ background: 'transparent', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
          <BookOpen size={18} /> Course approvals
        </button>
        <button onClick={() => setActiveTab('ORDERS')} className={`sidebar-link ${activeTab === 'ORDERS' ? 'active' : ''}`} style={{ background: 'transparent', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
          <CreditCard size={18} /> Orders & Payments
        </button>

        <button onClick={handleLogout} className="sidebar-link" style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', marginTop: 'auto' }}>
          <LogOut size={18} /> Log Out
        </button>
      </aside>

      {/* Main Panel Content */}
      <main className="main-content">
        <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>System Administration</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>Verify listings, process transactions, and moderate user accounts.</p>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            {/* Tab 1: Platform Stats */}
            {activeTab === 'STATS' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
                  <div className="glass-card" style={{ padding: '24px' }}>
                    <Users size={24} color="var(--primary)" style={{ marginBottom: '8px' }} />
                    <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Students</h4>
                    <p style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#fff' }}>{stats.totalStudents}</p>
                  </div>
                  <div className="glass-card" style={{ padding: '24px' }}>
                    <Users size={24} color="var(--secondary)" style={{ marginBottom: '8px' }} />
                    <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Instructors</h4>
                    <p style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#fff' }}>{stats.totalInstructors}</p>
                  </div>
                  <div className="glass-card" style={{ padding: '24px' }}>
                    <CreditCard size={24} color="#f59e0b" style={{ marginBottom: '8px' }} />
                    <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Revenue</h4>
                    <p style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: 'var(--secondary)' }}>
                      ₹{stats.totalRevenue ? stats.totalRevenue.toFixed(2) : '0.00'}
                    </p>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '32px' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Course Inventories</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', textAlign: 'center' }}>
                    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>{stats.totalCourses}</span>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Total Courses</span>
                    </div>
                    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--secondary)' }}>{stats.approvedCourses}</span>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Approved</span>
                    </div>
                    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning)' }}>{stats.pendingCourses}</span>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Pending Approval</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: User management */}
            {activeTab === 'USERS' && (
              <div className="glass-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Manage Users</h3>
                <div className="custom-table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td>{u.id}</td>
                          <td style={{ fontWeight: 600, color: '#fff' }}>{u.name}</td>
                          <td>{u.email}</td>
                          <td>
                            <span className={`badge ${u.role === 'ADMIN' ? 'badge-danger' : (u.role === 'INSTRUCTOR' ? 'badge-warning' : 'badge-success')}`}>
                              {u.role}
                            </span>
                          </td>
                          <td>
                            {u.role !== 'ADMIN' && (
                              <button onClick={() => handleDeleteUser(u.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                                <Trash2 size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 3: Course Moderation */}
            {activeTab === 'COURSES' && (
              <div className="glass-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Manage Course Approvals</h3>
                <div className="custom-table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Instructor</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((c) => (
                        <tr key={c.id}>
                          <td>{c.id}</td>
                          <td style={{ fontWeight: 600, color: '#fff' }}>{c.title}</td>
                          <td>{c.instructor.name}</td>
                          <td>{c.price > 0 ? `₹${c.price}` : 'Free'}</td>
                          <td>
                            {c.approved ? (
                              <span className="badge badge-success">Approved</span>
                            ) : (
                              <span className="badge badge-warning">Pending</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '12px' }}>
                              {!c.approved && (
                                <button onClick={() => handleApproveCourse(c.id)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                                  <Check size={14} /> Approve
                                </button>
                              )}
                              <button onClick={() => handleDeleteCourse(c.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 4: Orders Ledger */}
            {activeTab === 'ORDERS' && (
              <div className="glass-card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Order Book Ledger</h3>
                <div className="custom-table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Razorpay Order ID</th>
                        <th>Student</th>
                        <th>Course</th>
                        <th>Price</th>
                        <th>Payment Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id}>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#fff' }}>{o.razorpayOrderId}</td>
                          <td>{o.student.name}</td>
                          <td>{o.course.title}</td>
                          <td>₹{o.amount.toFixed(2)}</td>
                          <td>
                            <span className={`badge ${o.status === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                              {o.status}
                            </span>
                          </td>
                          <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
