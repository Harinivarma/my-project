import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/api';
import { Search, GraduationCap } from 'lucide-react';

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchVal = searchParams.get('search') || '';

  const [search, setSearch] = useState(searchVal);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Software Development', 'Data Science', 'Business', 'Design', 'Marketing'];

  useEffect(() => {
    fetchCourses(searchVal);
  }, [searchVal]);

  const fetchCourses = async (searchQuery) => {
    setLoading(true);
    try {
      let url = '/courses';
      if (searchQuery) {
        url += `?search=${encodeURIComponent(searchQuery)}`;
      }
      const response = await api.get(url);
      setCourses(response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ search });
  };

  const filteredCourses = selectedCategory === 'All'
    ? courses
    : courses.filter(c => c.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div style={{ minHeight: '100vh', padding: '40px 0' }}>
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', gap: '8px', color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <span style={{ color: '#fff' }}>Catalog</span>
        </div>

        <h1 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>Explore Courses</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>Learn from our massive database of masterclass topics.</p>

        {/* Search and Filters Layout */}
        <div style={{
          display: 'flex',
          gap: '24px',
          flexDirection: 'column',
          marginBottom: '40px'
        }}>
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} style={{
            display: 'flex',
            background: 'rgba(22, 28, 45, 0.7)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '4px',
            maxWidth: '500px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, paddingLeft: '16px' }}>
              <Search color="var(--text-secondary)" size={20} />
              <input
                type="text"
                placeholder="Search by title, tags or categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  padding: '12px',
                  fontSize: '0.95rem'
                }}
              />
            </div>
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          {/* Category Filters */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
            <div className="spinner"></div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 40px',
            background: 'rgba(22, 28, 45, 0.4)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px'
          }}>
            <GraduationCap size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>No Courses Found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>We couldn't find any courses matching your search query or filters.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
            {filteredCourses.map((course) => (
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
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '54px' }}>
                    {course.description}
                  </p>

                  {course.skillsTags && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                      {course.skillsTags.split(',').map((t, idx) => (
                        <span key={idx} style={{
                          background: 'rgba(255,255,255,0.05)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)'
                        }}>{t.trim()}</span>
                      ))}
                    </div>
                  )}

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
    </div>
  );
}
