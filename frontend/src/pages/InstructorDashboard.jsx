import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { BookOpen, Award, Clipboard, User, LogOut, LayoutDashboard, PlusCircle, CheckCircle, Hourglass } from 'lucide-react';

export default function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if (!user || user.role !== 'INSTRUCTOR') {
      navigate('/login');
      return;
    }
    fetchInstructorCourses();
  }, []);

  const fetchInstructorCourses = async () => {
    try {
      const response = await api.get('/courses/instructor/my-courses');
      setCourses(response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
          <Clipboard size={24} color="var(--primary)" />
          <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>Instructor Portal</span>
        </div>
        
        <Link to="/instructor" className="sidebar-link active">
          <LayoutDashboard size={18} /> Manage Courses
        </Link>
        <Link to="/instructor/create" className="sidebar-link">
          <PlusCircle size={18} /> Create Course
        </Link>
        <Link to="/profile" className="sidebar-link">
          <User size={18} /> My Profile
        </Link>
        
        <button onClick={handleLogout} className="sidebar-link" style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', marginTop: 'auto' }}>
          <LogOut size={18} /> Log Out
        </button>
      </aside>

      {/* Main Panel Content */}
      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem' }}>Instructor Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Create and manage syllabus contents, approve quizzes, and monitor students</p>
          </div>
          <Link to="/instructor/create" className="btn btn-primary" style={{ display: 'inline-flex', gap: '8px' }}>
            <PlusCircle size={18} /> Create Course
          </Link>
        </div>

        {/* Info Grid Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <BookOpen size={24} color="var(--primary)" style={{ marginBottom: '8px' }} />
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Active Courses</h4>
            <p style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#fff' }}>{courses.length}</p>
          </div>
          <div className="glass-card" style={{ padding: '24px' }}>
            <CheckCircle size={24} color="var(--secondary)" style={{ marginBottom: '8px' }} />
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Approved Listings</h4>
            <p style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#fff' }}>
              {courses.filter(c => c.approved).length}
            </p>
          </div>
          <div className="glass-card" style={{ padding: '24px' }}>
            <Hourglass size={24} color="#f59e0b" style={{ marginBottom: '8px' }} />
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Pending Approvals</h4>
            <p style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#fff' }}>
              {courses.filter(c => !c.approved).length}
            </p>
          </div>
        </div>

        {/* Courses Table Ledger */}
        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Your Courses</h2>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div className="spinner"></div>
          </div>
        ) : courses.length === 0 ? (
          <div style={{
            background: 'rgba(22, 28, 45, 0.4)',
            border: '1px solid var(--border-color)',
            padding: '60px 40px',
            borderRadius: '16px',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>No Courses Created</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Get started by publishing your first course topic.</p>
            <Link to="/instructor/create" className="btn btn-primary">Create Course</Link>
          </div>
        ) : (
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <img
                        src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&auto=format&fit=crop&q=60'}
                        alt={course.title}
                        style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    </td>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{course.title}</td>
                    <td>{course.category}</td>
                    <td>{course.price > 0 ? `₹${course.price}` : 'Free'}</td>
                    <td>
                      {course.approved ? (
                        <span className="badge badge-success">Approved</span>
                      ) : (
                        <span className="badge badge-warning">Pending</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <Link to={`/instructor/course/${course.id}/lessons`} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                          Add Lessons
                        </Link>
                        <Link to={`/instructor/course/${course.id}/quiz-generate`} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                          Generate Quiz
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
