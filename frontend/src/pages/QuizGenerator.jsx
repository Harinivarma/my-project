import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { Clipboard, User, LogOut, LayoutDashboard, PlusCircle, ArrowLeft, BrainCircuit, CheckCircle, AlertTriangle } from 'lucide-react';

export default function QuizGenerator() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [quizTitle, setQuizTitle] = useState('');
  const [content, setContent] = useState('');
  const [generating, setGenerating] = useState(false);
  
  // Preview states
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [previewQuestions, setPreviewQuestions] = useState([]);

  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if (!user || user.role !== 'INSTRUCTOR') {
      navigate('/login');
      return;
    }
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const response = await api.get(`/courses/${courseId}`);
      setCourse(response.data);
      setQuizTitle(`Quiz: ${response.data.title}`);
    } catch (e) {
      console.error(e);
      alert('Failed to retrieve course details.');
      navigate('/instructor');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setGeneratedQuiz(null);
    setPreviewQuestions([]);

    try {
      // Triggers Gemini API structured quiz generation
      const response = await api.post('/quizzes/generate', {
        courseId: parseInt(courseId),
        quizTitle,
        content
      });
      
      const quiz = response.data;
      setGeneratedQuiz(quiz);

      // Load newly created questions
      const questionsRes = await api.get(`/quizzes/${quiz.id}/questions`);
      setPreviewQuestions(questionsRes.data);
      alert('AI Quiz template generated and saved successfully!');
    } catch (err) {
      alert(err.response?.data || 'Failed to generate quiz. Check your AI credentials.');
    } finally {
      setGenerating(false);
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
          <h1 style={{ fontSize: '2.2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BrainCircuit size={28} color="var(--primary)" /> AI Quiz Generator
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Provide course notes/content. Our LLM will draft 5 custom structured MCQs.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '32px' }}>
          {/* Note inputs form */}
          <div className="glass-card" style={{ padding: '32px', height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '24px' }}>Submit Core Content</h2>
            
            <form onSubmit={handleGenerate}>
              <div className="form-group">
                <label className="form-label" htmlFor="quizTitle">Quiz Name / Topic</label>
                <input
                  id="quizTitle"
                  type="text"
                  className="form-input"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" htmlFor="content">Course Notes (Text Context)</label>
                <textarea
                  id="content"
                  className="form-input"
                  rows={8}
                  placeholder="Paste textbook definitions, lecture transcripts, or notes for the AI model to read..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  style={{ resize: 'vertical', minHeight: '200px' }}
                />
              </div>

              <button type="submit" disabled={generating} className="btn btn-secondary" style={{ width: '100%' }}>
                {generating ? 'Generating via AI...' : 'Generate MCQ Quiz'}
              </button>
            </form>
          </div>

          {/* AI generated preview panel */}
          <div className="glass-card" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '24px' }}>AI Preview & Questions Log</h2>
            
            {generating && (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
                <h4 style={{ color: '#fff' }}>Invoking Structured AI API...</h4>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '0.85rem' }}>
                  Analyzing notes and extracting MCQs. This takes around 10-15 seconds.
                </p>
              </div>
            )}

            {!generating && !generatedQuiz && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                <AlertTriangle size={32} style={{ margin: '0 auto 12px' }} />
                <p>Provide course text on the left panel to execute the AI generator.</p>
              </div>
            )}

            {!generating && generatedQuiz && (
              <div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--secondary)', marginBottom: '24px' }}>
                  <CheckCircle size={18} />
                  <span style={{ fontWeight: 700 }}>Saved: {generatedQuiz.title}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  {previewQuestions.map((q, idx) => (
                    <div key={q.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                      <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '12px' }}>
                        {idx + 1}. {q.question}
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <div>A. {q.optionA}</div>
                        <div>B. {q.optionB}</div>
                        <div>C. {q.optionC}</div>
                        <div>D. {q.optionD}</div>
                      </div>
                      <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--secondary)' }}>
                        Correct Answer: {q.correctAnswer}
                      </div>
                      <div style={{ marginTop: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Reason: {q.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
