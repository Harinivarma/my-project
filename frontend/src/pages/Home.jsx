import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { Search, BookOpen, GraduationCap, Award, Shield, User, LogOut } from 'lucide-react';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    fetchFeaturedCourses();
  }, []);

  const fetchFeaturedCourses = async () => {
    try {
      const response = await api.get('/courses');
      // Show first 6 featured courses
      setCourses(response.data.slice(0, 6));
    } catch (e) {
      console.error("Error fetching courses:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/courses?search=${encodeURIComponent(search.trim())}`);
    } else {
      navigate('/courses');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'INSTRUCTOR') return '/instructor';
    return '/dashboard';
  };

  return (
    <div>
      {/* Navbar */}
      <nav style={{
        height: '70px',
        background: 'rgba(17, 24, 39, 0.95)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(8px)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GraduationCap size={32} color="var(--primary)" />
            <span style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
              Edu<span style={{ color: 'var(--primary)' }}>AI</span>
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link to="/courses" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>Browse Courses</Link>
            
            {user ? (
              <>
                <Link to={getDashboardLink()} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>Dashboard</Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--border-color)', paddingLeft: '24px' }}>
                  <User size={18} color="var(--text-secondary)" />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</span>
                  <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                    <LogOut size={14} /> Log Out
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '12px' }}>
                <Link to="/login" className="btn btn-outline">Log In</Link>
                <Link to="/register" className="btn btn-primary">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '100px 0 80px',
        textAlign: 'center',
        background: 'radial-gradient(circle at top, rgba(99, 102, 241, 0.15) 0%, transparent 60%)'
      }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <span style={{
            background: 'rgba(99, 102, 241, 0.1)',
            color: 'var(--primary)',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>Next-Generation Learning</span>
          
          <h1 style={{ fontSize: '3.5rem', marginTop: '20px', marginBottom: '24px', lineHeight: 1.15 }}>
            Unlock Your Tech Potential with <span style={{ background: 'linear-gradient(to right, #6366f1, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI-Powered</span> Learning
          </h1>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '40px', lineHeight: 1.6 }}>
            Browse masterclasses created by expert instructors, get mathematically personalized NLP recommendations, and test your knowledge with instant AI-generated quizzes.
          </p>

          <form onSubmit={handleSearchSubmit} style={{
            display: 'flex',
            background: 'rgba(17, 24, 39, 0.8)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '6px',
            maxWidth: '600px',
            margin: '0 auto 50px',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, paddingLeft: '16px' }}>
              <Search color="var(--text-secondary)" size={20} />
              <input
                type="text"
                placeholder="What skill do you want to learn today?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  padding: '12px',
                  fontSize: '1rem'
                }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ borderRadius: '8px' }}>Search</button>
          </form>

          {/* Core Features */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginTop: '40px' }}>
            <div className="glass-card" style={{ padding: '32px', textAlign: 'left' }}>
              <BookOpen size={36} color="var(--primary)" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Personalized NLP Engine</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Our backend OpenNLP platform matches course tags and descriptions against your student profile vector for mathematical similarity.
              </p>
            </div>
            <div className="glass-card" style={{ padding: '32px', textAlign: 'left' }}>
              <Award size={36} color="var(--secondary)" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>AI Quiz Generation</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Instructors can generate high-quality MCQ quiz templates instantly from notes using structured LLM APIs.
              </p>
            </div>
            <div className="glass-card" style={{ padding: '32px', textAlign: 'left' }}>
              <Shield size={36} color="#f59e0b" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Secure Razorpay Integration</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Integrated directly with Razorpay Checkout. Order amounts are verified strictly on the backend via HMAC signatures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section style={{ padding: '80px 0', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
            <div>
              <h2 style={{ fontSize: '2.2rem' }}>Featured Courses</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Start learning from our top approved masterclasses</p>
            </div>
            <Link to="/courses" className="btn btn-outline">View All Courses</Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
              <div className="spinner"></div>
            </div>
          ) : courses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
              No approved courses are currently available. Check back soon!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
              {courses.map((course) => (
                <div key={course.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <img
                    src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60'}
                    alt={course.title}
                    style={{ width: '100%', height: '180px', objectFit: 'cover', borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}
                  />
                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>{course.category}</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--secondary)' }}>
                        {course.price > 0 ? `₹${course.price}` : 'Free'}
                      </span>
                    </div>
                    
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', lineHeight: 1.4 }}>{course.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px', display: '-webkit-box', WebkitLineBreak: 'auto', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '54px' }}>
                      {course.description}
                    </p>
                    
                    <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        By {course.instructor.name}
                      </span>
                      <Link to={`/courses/${course.id}`} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: 'rgba(10, 15, 26, 0.95)',
        borderTop: '1px solid var(--border-color)',
        padding: '60px 0 40px',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px', marginBottom: '40px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <GraduationCap size={28} color="var(--primary)" />
              <span style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800 }}>EduAI</span>
            </div>
            <p style={{ maxWidth: '300px', lineHeight: 1.6 }}>
              A premium, secure learning marketplace helping students master new coding skills with AI.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '60px' }}>
            <div>
              <h4 style={{ color: '#fff', marginBottom: '16px' }}>Marketplace</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li><Link to="/courses" style={{ color: 'inherit', textDecoration: 'none' }}>Browse Courses</Link></li>
                <li><Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>Student Sign In</Link></li>
                <li><Link to="/register" style={{ color: 'inherit', textDecoration: 'none' }}>Join as Instructor</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: '#fff', marginBottom: '16px' }}>Technology</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li><span style={{ color: 'inherit' }}>Spring Boot & JPA</span></li>
                <li><span style={{ color: 'inherit' }}>Apache OpenNLP Match</span></li>
                <li><span style={{ color: 'inherit' }}>Gemini AI Quizzes</span></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="container" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
          <span>© 2026 EduAI. All rights reserved.</span>
          <span>Made for modern software engineers.</span>
        </div>
      </footer>
    </div>
  );
}
