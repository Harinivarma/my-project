import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { ArrowLeft, PlayCircle, BookOpen, Award, CheckCircle, Circle, FileText, ChevronRight } from 'lucide-react';

export default function LearningPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [progress, setProgress] = useState({ percentage: 0, completionMap: {} });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourseAndLessons();
  }, [courseId]);

  const fetchCourseAndLessons = async () => {
    try {
      // Get course metadata
      const courseRes = await api.get(`/courses/${courseId}`);
      setCourse(courseRes.data);

      // Get lessons list
      const lessonsRes = await api.get(`/courses/${courseId}/lessons`);
      setLessons(lessonsRes.data);
      if (lessonsRes.data.length > 0) {
        setCurrentLesson(lessonsRes.data[0]);
      }

      // Get progress status
      const progRes = await api.get(`/progress/${courseId}`);
      setProgress(progRes.data);

      // Get quizzes
      const quizzesRes = await api.get(`/quizzes/course/${courseId}`);
      setQuizzes(quizzesRes.data);
    } catch (e) {
      console.error(e);
      alert('Access Denied: You must purchase this course to access lessons.');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLessonSelect = (lesson) => {
    setCurrentLesson(lesson);
  };

  const toggleCompleted = async () => {
    if (!currentLesson) return;
    const isCompleted = !progress.completionMap[currentLesson.id];

    try {
      await api.post('/progress', {
        lessonId: currentLesson.id,
        completed: isCompleted
      });
      
      // Reload progress metrics
      const progRes = await api.get(`/progress/${courseId}`);
      setProgress(progRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0', minHeight: '100vh' }}>
      <div className="container">
        
        {/* Header Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>
            <ArrowLeft size={18} /> Back to Dashboard
          </Link>
          <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>{course?.title}</span>
        </div>

        {/* Two column grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.2fr', gap: '32px' }}>
          
          {/* Left Column: Lesson Player and Details */}
          <div>
            {currentLesson ? (
              <div>
                {/* Premium Mock Video Player */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '420px',
                  background: '#090d16',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  border: '1px solid var(--border-color)',
                  marginBottom: '24px',
                  boxShadow: 'var(--shadow-md)'
                }}>
                  {currentLesson.videoUrl ? (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <PlayCircle size={64} color="var(--primary)" style={{ opacity: 0.8 }} />
                      <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem' }}>
                        Source URL: {currentLesson.videoUrl}
                      </div>
                    </div>
                  ) : (
                    <>
                      <FileText size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                      <span style={{ color: 'var(--text-secondary)' }}>No video uploaded for this lesson.</span>
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '1.8rem' }}>{currentLesson.title}</h2>
                  
                  {/* Mark Completed Checkbox */}
                  <button
                    onClick={toggleCompleted}
                    className="btn"
                    style={{
                      background: progress.completionMap[currentLesson.id] ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${progress.completionMap[currentLesson.id] ? 'var(--secondary)' : 'var(--border-color)'}`,
                      color: progress.completionMap[currentLesson.id] ? 'var(--secondary)' : 'var(--text-primary)',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {progress.completionMap[currentLesson.id] ? (
                      <>
                        <CheckCircle size={18} /> Completed
                      </>
                    ) : (
                      <>
                        <Circle size={18} /> Mark Completed
                      </>
                    )}
                  </button>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Lesson Notes</h3>
                <div className="glass-card" style={{ padding: '24px', lineHeight: 1.6, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                  {currentLesson.notes || 'No notes available for this lesson.'}
                </div>

                {/* Quizzes Section */}
                <h2 style={{ fontSize: '1.6rem', marginTop: '48px', marginBottom: '16px' }}>Course Quizzes</h2>
                {quizzes.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>No quizzes are currently available for this course.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {quizzes.map((quiz) => (
                      <div key={quiz.id} className="glass-card" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '20px 24px',
                        borderRadius: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Award size={24} color="var(--primary)" />
                          <div>
                            <h4 style={{ color: '#fff', fontSize: '1.05rem' }}>{quiz.title}</h4>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>AI-Generated MCQ Quiz</span>
                          </div>
                        </div>
                        <Link to={`/quiz/${quiz.id}`} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                          Take Quiz <ChevronRight size={14} />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <BookOpen size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                <h3>No Lessons Found</h3>
                <p style={{ color: 'var(--text-secondary)' }}>The instructor hasn't uploaded any content for this course yet.</p>
              </div>
            )}
          </div>

          {/* Right Column: Syllabus Sidebar */}
          <div>
            <div className="glass-card" style={{ padding: '24px', position: 'sticky', top: '100px' }}>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <span>Course Progress</span>
                  <span style={{ color: '#fff', fontWeight: 700 }}>{progress.percentage}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                  <div style={{ width: `${progress.percentage}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px' }}></div>
                </div>
              </div>

              <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Lessons List</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {lessons.map((lesson, idx) => {
                  const isActive = currentLesson && currentLesson.id === lesson.id;
                  const isCompleted = progress.completionMap[lesson.id];
                  
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => handleLessonSelect(lesson)}
                      style={{
                        background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                        border: 'none',
                        borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                        padding: '12px 16px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        borderRadius: '0 8px 8px 0',
                        color: isActive ? '#fff' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        width: '100%',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span style={{ fontSize: '0.9rem', fontWeight: isActive ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                        {idx + 1}. {lesson.title}
                      </span>
                      {isCompleted ? (
                        <CheckCircle size={16} color="var(--secondary)" style={{ flexShrink: 0 }} />
                      ) : (
                        <PlayCircle size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
