import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { BookOpen, ShieldAlert, Award, Clock, DollarSign, CheckCircle } from 'lucide-react';

export default function CourseDetails() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState([]);
  const navigate = useNavigate();

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      // Fetch metadata
      const courseRes = await api.get(`/courses/${id}`);
      setCourse(courseRes.data);

      // Check enrollment if logged in
      if (user) {
        const enrollCheck = await api.get(`/enrollments/check/${id}`);
        setIsEnrolled(enrollCheck.data);
      }

      // Fetch lessons count/outline
      // Wait, if it's paid, this might return 403. If so, catch the error.
      try {
        const lessonsRes = await api.get(`/courses/${id}/lessons`);
        setLessons(lessonsRes.data);
      } catch (err) {
        // Fallback or empty if not enrolled (this is expected for protected content)
        setLessons([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleEnrollFree = async () => {
    try {
      await api.post('/enrollments/enroll-free', { courseId: course.id });
      alert('Enrolled successfully!');
      setIsEnrolled(true);
      navigate(`/learning/${course.id}`);
    } catch (e) {
      alert(e.response?.data || 'Failed to enroll');
    }
  };

  const handleBuyCourse = async () => {
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      alert('Failed to load Razorpay SDK. Check your internet connection.');
      return;
    }

    try {
      // 1. Create order on backend
      const response = await api.post('/payments/create-order', { courseId: course.id });
      const orderData = response.data; // contains id, razorpayOrderId, amount

      // 2. Open Razorpay Checkout options
      const options = {
        // The backend should ideally expose Key ID or we configure it.
        // We'll read key from environment or use a dummy test key if local
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder', 
        amount: Math.round(orderData.amount * 100), // convert rupees to paise
        currency: 'INR',
        name: 'EduAI Portal',
        description: `Enroll in ${course.title}`,
        order_id: orderData.razorpayOrderId,
        handler: async function (razorpayResponse) {
          try {
            // 3. Verify Payment on backend
            const verificationPayload = {
              razorpayOrderId: razorpayResponse.razorpay_order_id,
              razorpayPaymentId: razorpayResponse.razorpay_payment_id,
              razorpaySignature: razorpayResponse.razorpay_signature
            };

            const verifyRes = await api.post('/payments/verify', verificationPayload);
            if (verifyRes.data.verified) {
              alert('Payment verified! Welcome to the course.');
              setIsEnrolled(true);
              navigate(`/learning/${course.id}`);
            } else {
              alert('Payment signature verification failed.');
            }
          } catch (verifyError) {
            alert('Verification request failed.');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#6366f1'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (e) {
      console.error(e);
      let errorMsg = 'Order creation failed';
      if (e.response?.data) {
        if (typeof e.response.data === 'string') {
          errorMsg = e.response.data;
        } else if (e.response.data.message) {
          errorMsg = e.response.data.message;
        } else {
          errorMsg = JSON.stringify(e.response.data);
        }
      } else if (e.message) {
        errorMsg = e.message;
      }
      alert(errorMsg);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <ShieldAlert size={48} color="var(--danger)" style={{ marginBottom: '16px' }} />
        <h2>Course Not Found</h2>
        <p style={{ color: 'var(--text-secondary)' }}>The requested course may have been removed or does not exist.</p>
        <Link to="/courses" className="btn btn-primary" style={{ marginTop: '24px' }}>Back to Catalog</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '60px 0' }}>
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', gap: '8px', color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link to="/courses" style={{ color: 'inherit', textDecoration: 'none' }}>Catalog</Link>
          <span>/</span>
          <span style={{ color: '#fff' }}>{course.title}</span>
        </div>

        {/* Hero Course Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '48px' }}>
          {/* Main Info */}
          <div>
            <span className="badge badge-success" style={{ marginBottom: '16px' }}>{course.category}</span>
            <h1 style={{ fontSize: '2.8rem', marginBottom: '16px', lineHeight: 1.2 }}>{course.title}</h1>
            
            <div style={{ display: 'flex', gap: '24px', color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '0.95rem' }}>
              <span>Created by <strong style={{ color: '#fff' }}>{course.instructor.name}</strong></span>
              <span>•</span>
              <span>Updated {new Date(course.createdAt).toLocaleDateString()}</span>
            </div>

            <img
              src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
              alt={course.title}
              style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '16px', marginBottom: '40px', border: '1px solid var(--border-color)' }}
            />

            <h2 style={{ fontSize: '1.6rem', marginBottom: '16px' }}>About This Course</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '40px', whiteSpace: 'pre-wrap' }}>
              {course.description}
            </p>

            <h2 style={{ fontSize: '1.6rem', marginBottom: '20px' }}>Course Syllabus</h2>
            {lessons.length === 0 ? (
              <div style={{
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.1)',
                padding: '24px',
                borderRadius: '12px',
                color: 'var(--text-secondary)'
              }}>
                {isEnrolled 
                  ? 'No lessons have been uploaded for this course yet.'
                  : 'Syllabus content is locked. Please purchase or enroll in this course to view the syllabus and lessons.'
                }
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {lessons.map((lesson, idx) => (
                  <div key={lesson.id} className="glass-card" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 24px',
                    borderRadius: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>{idx + 1}</span>
                      <span style={{ fontWeight: 600 }}>{lesson.title}</span>
                    </div>
                    {isEnrolled && (
                      <span style={{ fontSize: '0.85rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={14} /> Available
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing / Enrollment Widget */}
          <div>
            <div className="glass-card" style={{ padding: '32px', position: 'sticky', top: '100px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <DollarSign size={24} color="var(--secondary)" />
                <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff' }}>
                  {course.price > 0 ? `₹${course.price}` : 'Free'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Lessons:</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{lessons.length} lessons</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Language:</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>English</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Access:</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>Lifetime access</span>
                </div>
              </div>

              {user ? (
                isEnrolled ? (
                  <Link to={`/learning/${course.id}`} className="btn btn-secondary" style={{ width: '100%', padding: '14px', textAlign: 'center' }}>
                    Start Learning
                  </Link>
                ) : course.price > 0 ? (
                  <button onClick={handleBuyCourse} className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
                    Buy Course
                  </button>
                ) : (
                  <button onClick={handleEnrollFree} className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
                    Enroll Now (Free)
                  </button>
                )
              ) : (
                <Link to="/login" className="btn btn-primary" style={{ width: '100%', padding: '14px', textAlign: 'center' }}>
                  Sign In to Enroll
                </Link>
              )}

              <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Clock size={14} />
                  <span>30-Day Money-Back Guarantee</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Award size={14} />
                  <span>Certificate of Completion</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
