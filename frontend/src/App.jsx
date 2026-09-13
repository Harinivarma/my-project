import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import CourseCatalog from './pages/CourseCatalog';
import CourseDetails from './pages/CourseDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import LearningPage from './pages/LearningPage';
import QuizPage from './pages/QuizPage';
import Profile from './pages/Profile';
import RecommendedCourses from './pages/RecommendedCourses';
import InstructorDashboard from './pages/InstructorDashboard';
import CreateCourse from './pages/CreateCourse';
import ManageCourseContent from './pages/ManageCourseContent';
import QuizGenerator from './pages/QuizGenerator';
import AdminDashboard from './pages/AdminDashboard';

// Route guards to protect panels based on local storage roles
function StudentRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.role === 'STUDENT' ? children : <Navigate to="/login" />;
}

function InstructorRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.role === 'INSTRUCTOR' ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.role === 'ADMIN' ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<CourseCatalog />} />
        <Route path="/courses/:id" element={<CourseDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Student Routes */}
        <Route path="/dashboard" element={
          <StudentRoute>
            <StudentDashboard />
          </StudentRoute>
        } />
        <Route path="/learning/:courseId" element={
          <StudentRoute>
            <LearningPage />
          </StudentRoute>
        } />
        <Route path="/quiz/:quizId" element={
          <StudentRoute>
            <QuizPage />
          </StudentRoute>
        } />
        <Route path="/profile" element={
          <StudentRoute>
            <Profile />
          </StudentRoute>
        } />
        <Route path="/recommendations" element={
          <StudentRoute>
            <RecommendedCourses />
          </StudentRoute>
        } />

        {/* Protected Instructor Routes */}
        <Route path="/instructor" element={
          <InstructorRoute>
            <InstructorDashboard />
          </InstructorRoute>
        } />
        <Route path="/instructor/create" element={
          <InstructorRoute>
            <CreateCourse />
          </InstructorRoute>
        } />
        <Route path="/instructor/course/:courseId/lessons" element={
          <InstructorRoute>
            <ManageCourseContent />
          </InstructorRoute>
        } />
        <Route path="/instructor/course/:courseId/quiz-generate" element={
          <InstructorRoute>
            <QuizGenerator />
          </InstructorRoute>
        } />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
