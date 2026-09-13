import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        login: resolve(import.meta.dirname, 'login.html'),
        register: resolve(import.meta.dirname, 'register.html'),
        courses: resolve(import.meta.dirname, 'courses.html'),
        courseDetails: resolve(import.meta.dirname, 'course-details.html'),
        dashboard: resolve(import.meta.dirname, 'dashboard.html'),
        learning: resolve(import.meta.dirname, 'learning.html'),
        quiz: resolve(import.meta.dirname, 'quiz.html'),
        profile: resolve(import.meta.dirname, 'profile.html'),
        recommendations: resolve(import.meta.dirname, 'recommendations.html'),
        instructorDashboard: resolve(import.meta.dirname, 'instructor-dashboard.html'),
        createCourse: resolve(import.meta.dirname, 'create-course.html'),
        manageContent: resolve(import.meta.dirname, 'manage-content.html'),
        quizGenerator: resolve(import.meta.dirname, 'quiz-generator.html'),
        adminDashboard: resolve(import.meta.dirname, 'admin-dashboard.html'),
      },
    },
  },
});
