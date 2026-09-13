import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { Clipboard, User, LogOut, LayoutDashboard, PlusCircle, Save, Trash2, ArrowLeft, Edit2 } from 'lucide-react';

export default function ManageCourseContent() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  // New lesson form fields
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [sequenceOrder, setSequenceOrder] = useState('');
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if (!user || user.role !== 'INSTRUCTOR') {
      navigate('/login');
      return;
    }
    fetchCourseAndLessons();
  }, [courseId]);

  const fetchCourseAndLessons = async () => {
    try {
      const courseRes = await api.get(`/courses/${courseId}`);
      setCourse(courseRes.data);

      const lessonsRes = await api.get(`/courses/${courseId}/lessons`);
      setLessons(lessonsRes.data);

      // Default next sequence order if not editing
      if (!editingLessonId) {
        setSequenceOrder(lessonsRes.data.length + 1);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to retrieve course syllabus details.');
      navigate('/instructor');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingLessonId) {
        await api.put(`/courses/lessons/${editingLessonId}`, {
          title,
          videoUrl,
          notes,
          sequenceOrder: parseInt(sequenceOrder)
        });
        setEditingLessonId(null);
      } else {
        await api.post(`/courses/${courseId}/lessons`, {
          title,
          videoUrl,
          notes,
          sequenceOrder: parseInt(sequenceOrder)
        });
      }
      
      // Clear fields
      setTitle('');
      setVideoUrl('');
      setNotes('');
      
      // Reload syllabus
      fetchCourseAndLessons();
    } catch (err) {
      alert(editingLessonId ? 'Failed to update lesson content.' : 'Failed to add lesson content.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStart = (lesson) => {
    setEditingLessonId(lesson.id);
    setTitle(lesson.title);
    setVideoUrl(lesson.videoUrl || '');
    setNotes(lesson.notes || '');
    setSequenceOrder(lesson.sequenceOrder);
  };

  const handleCancelEdit = () => {
    setEditingLessonId(null);
    setTitle('');
    setVideoUrl('');
    setNotes('');
    setSequenceOrder(lessons.length + 1);
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure you want to remove this lesson?')) return;
    try {
      await api.delete(`/courses/lessons/${lessonId}`);
      fetchCourseAndLessons();
    } catch (e) {
      alert('Failed to remove lesson module.');
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
        <div style={{ marginBottom: '32px' }}>
          <Link to="/instructor" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600, marginBottom: '16px' }}>
            <ArrowLeft size={18} /> Back to Dashboard
          </Link>
          <h1 style={{ fontSize: '2.2rem' }}>Syllabus: {course?.title}</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Add individual video modules and learning documentation</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr', gap: '32px' }}>
          {/* Add/Edit Lesson Form */}
          <div className="glass-card" style={{ padding: '32px', height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '24px' }}>
              {editingLessonId ? 'Edit Lesson Module' : 'Add New Module'}
            </h2>
            
            <form onSubmit={handleSaveLesson}>
              <div className="form-group">
                <label className="form-label" htmlFor="lessonTitle">Lesson Title</label>
                <input
                  id="lessonTitle"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Introduction to OOP Paradigm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="videoUrl">Video URL</label>
                <input
                  id="videoUrl"
                  type="url"
                  className="form-input"
                  placeholder="https://example.com/stream/video.mp4"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="sequenceOrder">Sequence Order</label>
                <input
                  id="sequenceOrder"
                  type="number"
                  className="form-input"
                  value={sequenceOrder}
                  onChange={(e) => setSequenceOrder(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" htmlFor="notes">Notes / Content</label>
                <textarea
                  id="notes"
                  className="form-input"
                  rows={5}
                  placeholder="Write full markdown, details, or exercises for this lesson..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ flex: 1 }}>
                  {editingLessonId ? (submitting ? 'Updating...' : 'Update Lesson') : (submitting ? 'Adding...' : 'Add Lesson Module')}
                </button>
                {editingLessonId && (
                  <button type="button" onClick={handleCancelEdit} className="btn btn-outline" style={{ flex: 1 }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Lessons list */}
          <div className="glass-card" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '24px' }}>Current Syllabus Outline</h2>
            
            {lessons.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
                No lessons have been created yet. Use the left form to append modules.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {lessons.map((l) => (
                  <div key={l.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>
                        Seq {l.sequenceOrder}
                      </span>
                      <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>{l.title}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleEditStart(l)} style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px'
                      }}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteLesson(l.id)} style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--danger)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px'
                      }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
