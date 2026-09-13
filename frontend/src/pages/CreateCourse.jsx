import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { Clipboard, User, LogOut, LayoutDashboard, PlusCircle, Save } from 'lucide-react';

export default function CreateCourse() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Software Development');
  const [skillsTags, setSkillsTags] = useState('');
  const [price, setPrice] = useState(0);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if (!user || user.role !== 'INSTRUCTOR') {
      navigate('/login');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post('/courses', {
        title,
        description,
        category,
        skillsTags,
        price: parseFloat(price),
        thumbnailUrl
      });
      alert('Course created successfully! Pending admin approval.');
      navigate('/instructor');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course. Ensure fields are correct.');
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

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', padding: '0 8px' }}>
          <Clipboard size={24} color="var(--primary)" />
          <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>Instructor Portal</span>
        </div>
        
        <Link to="/instructor" className="sidebar-link">
          <LayoutDashboard size={18} /> Manage Courses
        </Link>
        <Link to="/instructor/create" className="sidebar-link active">
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
        <h1 style={{ fontSize: '2.2rem', marginBottom: '12px' }}>Publish a Course</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>Fill in the fields below. Admin verification will process new templates within 24 hours.</p>

        <div className="glass-card" style={{ padding: '32px', maxWidth: '800px' }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              padding: '12px 16px',
              color: 'var(--danger)',
              fontSize: '0.9rem',
              marginBottom: '24px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="title">Course Title</label>
              <input
                id="title"
                type="text"
                className="form-input"
                placeholder="e.g. Master Clean Code & OOP Principles"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="category">Category</label>
                <select
                  id="category"
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="Software Development">Software Development</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Business">Business</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="price">Price (Rupees)</label>
                <input
                  id="price"
                  type="number"
                  className="form-input"
                  min="0"
                  placeholder="e.g. 499 (0 for free)"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="skillsTags">Skills / Tags (Comma separated)</label>
              <input
                id="skillsTags"
                type="text"
                className="form-input"
                placeholder="e.g. Java, OOP, Collections, Abstraction"
                value={skillsTags}
                onChange={(e) => setSkillsTags(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="thumbnailUrl">Thumbnail URL</label>
              <input
                id="thumbnailUrl"
                type="url"
                className="form-input"
                placeholder="https://images.unsplash.com/photo-..."
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '32px' }}>
              <label className="form-label" htmlFor="description">Full Description</label>
              <textarea
                id="description"
                className="form-input"
                rows={6}
                placeholder="Detail what students will learn, target audience, and pre-requisites..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                style={{ resize: 'vertical', minHeight: '120px' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ display: 'inline-flex', gap: '8px' }}
            >
              <Save size={18} /> {submitting ? 'Creating Course...' : 'Submit Course'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
