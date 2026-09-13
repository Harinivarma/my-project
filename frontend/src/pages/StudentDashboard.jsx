import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { BookOpen, Award, Compass, User, LogOut, LayoutDashboard, ChevronRight } from 'lucide-react';

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if (!user || user.role !== 'STUDENT') {
      navigate('/login');
      return;
    }
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const response = await api.get('/enrollments/my-courses');
      setCourses(response.data);

      // Fetch progress metrics for each course
      const progData = {};
      for (let course of response.data) {
        try {
          const progRes = await api.get(`/progress/${course.id}`);
          progData[course.id] = progRes.data.percentage;
        } catch (e) {
          progData[course.id] = 0;
        }
      }
      setProgressMap(progData);
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
          <Compass size={24} color="var(--primary)" />
          <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>Student Hub</span>
        </div>
        
        <Link to="/dashboard" className="sidebar-link active">
          <LayoutDashboard size={18} /> Dashboard
        </Link>
        <Link to="/courses" className="sidebar-link">
          <Compass size={18} /> Browse Catalog
        </Link>
        <Link to="/recommendations" className="sidebar-link">
          <Award size={18} /> NLP Recommendations
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
            <h1 style={{ fontSize: '2.2rem' }}>Welcome, {user?.name}!</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Track your learning progress and acquired skills</p>
          </div>
          <Link to="/courses" className="btn btn-primary">Enroll in New Course</Link>
        </div>

        {/* Info Grid Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <BookOpen size={24} color="var(--primary)" style={{ marginBottom: '8px' }} />
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Enrolled Courses</h4>
            <p style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#fff' }}>{courses.length}</p>
          </div>
          <div className="glass-card" style={{ padding: '24px' }}>
            <Award size={24} color="var(--secondary)" style={{ marginBottom: '8px' }} />
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Completed Courses</h4>
            <p style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#fff' }}>
              {courses.filter(c => progressMap[c.id] === 100).length}
            </p>
          </div>
          <div className="glass-card" style={{ padding: '24px' }}>
            <User size={24} color="#f59e0b" style={{ marginBottom: '8px' }} />
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Profile Account</h4>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '16px', color: '#fff' }}>Role: STUDENT</p>
          </div>
        </div>

        {/* Enrolled Courses list */}
        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>My Enrolled Courses</h2>

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
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>No Enrolled Courses</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>You haven't enrolled in any courses yet.</p>
            <Link to="/courses" className="btn btn-primary">Browse Catalog</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {courses.map((course) => (
              <div key={course.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <img
                  src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60'}
                  alt={course.title}
                  style={{ width: '100%', height: '150px', objectFit: 'cover', borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}
                />
                
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span className="badge badge-success" style={{ fontSize: '0.65rem', alignSelf: 'flex-start', marginBottom: '8px' }}>
                    {course.category}
                  </span>
                  
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>{course.title}</h3>
                  
                  {/* Progress bar */}
                  <div style={{ marginBottom: '20px', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      <span>Progress</span>
                      <span>{progressMap[course.id] || 0}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                      <div style={{ width: `${progressMap[course.id] || 0}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px', transition: 'width 0.3s ease' }}></div>
                    </div>
                  </div>

                  <Link to={`/learning/${course.id}`} className="btn btn-outline" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    Continue Learning <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
