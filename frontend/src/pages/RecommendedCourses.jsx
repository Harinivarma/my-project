import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { Award, Compass, User, LogOut, LayoutDashboard, Sparkles, MessageCircle, BookOpen } from 'lucide-react';

export default function RecommendedCourses() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if (!user || user.role !== 'STUDENT') {
      navigate('/login');
      return;
    }
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await api.get('/recommendations');
      setRecommendations(response.data);
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
        
        <Link to="/dashboard" className="sidebar-link">
          <LayoutDashboard size={18} /> Dashboard
        </Link>
        <Link to="/courses" className="sidebar-link">
          <Compass size={18} /> Browse Catalog
        </Link>
        <Link to="/recommendations" className="sidebar-link active">
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
            <h1 style={{ fontSize: '2.2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Sparkles color="var(--primary)" size={28} /> AI-Powered Recommendations
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
              Cosine similarity matching based on your interests and completed course tags.
            </p>
          </div>
          <Link to="/profile" className="btn btn-outline">Edit Interests</Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
            <div className="spinner"></div>
          </div>
        ) : recommendations.length === 0 ? (
          <div style={{
            background: 'rgba(22, 28, 45, 0.4)',
            border: '1px solid var(--border-color)',
            padding: '60px 40px',
            borderRadius: '16px',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>No Recommendations</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Please add interests to your profile to let the OpenNLP model match topics.
            </p>
            <Link to="/profile" className="btn btn-primary">Edit Interests</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
            {recommendations.map((resultItem, idx) => {
              const { course, score, explanation } = resultItem;
              const matchPercent = Math.round(score * 100);
              
              return (
                <div key={course.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ position: 'relative' }}>
                    <img
                      src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60'}
                      alt={course.title}
                      style={{ width: '100%', height: '160px', objectFit: 'cover', borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}
                    />
                    
                    {/* Match Score Bubble */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'rgba(99, 102, 241, 0.9)',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backdropFilter: 'blur(4px)'
                    }}>
                      {matchPercent > 0 ? `${matchPercent}% Match` : 'General Fit'}
                    </div>
                  </div>

                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>{course.category}</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--secondary)' }}>
                        {course.price > 0 ? `₹${course.price}` : 'Free'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', lineHeight: 1.3 }}>{course.title}</h3>

                    {/* Explanatory Message Box */}
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-color)',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.4,
                      marginBottom: '16px',
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'flex-start'
                    }}>
                      <MessageCircle size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{explanation}</span>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        By {course.instructor.name}
                      </span>
                      <Link to={`/courses/${course.id}`} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                        View details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
