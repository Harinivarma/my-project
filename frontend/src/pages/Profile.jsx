import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { User, Shield, BookOpen, Compass, Award, LogOut, LayoutDashboard, Save, AlertCircle } from 'lucide-react';

export default function Profile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [interests, setInterests] = useState('');
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      const data = response.data;
      setName(data.name || '');
      setEmail(data.email || '');
      setRole(data.role || '');
      setInterests(data.interests || '');
      setSkills(data.skills || '');
    } catch (e) {
      console.error(e);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const response = await api.put('/auth/profile', {
        name,
        interests,
        skills
      });
      // Update cached user details in local storage
      const userCached = JSON.parse(localStorage.getItem('user') || '{}');
      userCached.name = response.data.name;
      localStorage.setItem('user', JSON.stringify(userCached));
      
      setSkills(response.data.skills || '');
      setMessage('Profile updated successfully!');
    } catch (err) {
      setMessage('Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

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
        <Link to="/recommendations" className="sidebar-link">
          <Award size={18} /> NLP Recommendations
        </Link>
        <Link to="/profile" className="sidebar-link active">
          <User size={18} /> My Profile
        </Link>
        
        <button onClick={handleLogout} className="sidebar-link" style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', marginTop: 'auto' }}>
          <LogOut size={18} /> Log Out
        </button>
      </aside>

      {/* Profile Form Area */}
      <main className="main-content">
        <h1 style={{ fontSize: '2.2rem', marginBottom: '12px' }}>My Profile</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>Manage your personalized preferences and view your acquired skillsets.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '32px' }}>
          {/* Main Details Form */}
          <div className="glass-card" style={{ padding: '32px' }}>
            {message && (
              <div style={{
                background: message.includes('success') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${message.includes('success') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                color: message.includes('success') ? 'var(--secondary)' : 'var(--danger)',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                marginBottom: '24px'
              }}>
                {message}
              </div>
            )}

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address (Locked)</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  value={email}
                  disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '32px' }}>
                <label className="form-label" htmlFor="interests">Interests (Comma separated)</label>
                <textarea
                  id="interests"
                  className="form-input"
                  rows={4}
                  placeholder="e.g. Java, Spring Boot, React, SQL, Cloud Architecture"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  style={{ resize: 'vertical', minHeight: '100px' }}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                  Our NLP engine uses these keywords to calculate course matching cosine similarity!
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ display: 'inline-flex', gap: '8px' }}
              >
                <Save size={18} /> {submitting ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          </div>

          {/* User Status / Skills Ledger */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Shield size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem' }}>Role Authority</h3>
              </div>
              <span className="badge badge-success">{role}</span>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                Verified role membership registered via system security.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Award size={20} color="var(--secondary)" />
                <h3 style={{ fontSize: '1.15rem' }}>Acquired Skills</h3>
              </div>
              {skills && skills.trim().length > 0 ? (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {skills.split(',').map((skill, idx) => (
                    <span key={idx} style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      color: 'var(--secondary)',
                      fontWeight: 600
                    }}>{skill.trim()}</span>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Start completing course modules to populate your skills register!
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
