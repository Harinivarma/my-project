import { renderNavbar, getUser } from './auth.js';
import { apiFetch } from './api.js';
import { RAZORPAY_KEY_ID } from './config.js';

let course = null;
let isEnrolled = false;
let lessons = [];

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('courses');

  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');

  if (!courseId) {
    renderNotFound();
    return;
  }

  fetchCourseDetails(courseId);
});

async function fetchCourseDetails(id) {
  const container = document.getElementById('details-container');
  if (!container) return;

  const user = getUser();

  try {
    course = await apiFetch(`/courses/${id}`);

    if (user) {
      try {
        isEnrolled = await apiFetch(`/enrollments/check/${id}`);
      } catch (e) {
        isEnrolled = false;
      }
    }

    try {
      lessons = await apiFetch(`/courses/${id}/lessons`);
    } catch (err) {
      lessons = [];
    }

    renderPage();
  } catch (err) {
    console.error(err);
    renderNotFound();
  }
}

function renderNotFound() {
  const container = document.getElementById('details-container');
  if (!container) return;
  container.innerHTML = `
    <div style="padding: 80px 0; text-align: center;">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 16px;">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
      <h2>Course Not Found</h2>
      <p style="color: var(--text-secondary);">The requested course may have been removed or does not exist.</p>
      <a href="courses.html" class="btn btn-primary" style="margin-top: 24px;">Back to Catalog</a>
    </div>
  `;
}

function renderPage() {
  const container = document.getElementById('details-container');
  if (!container || !course) return;

  const user = getUser();

  container.innerHTML = `
    <div style="display: flex; gap: 8px; color: var(--text-secondary); margin-bottom: 24px; font-size: 0.9rem;">
      <a href="index.html" style="color: inherit; text-decoration: none;">Home</a>
      <span>/</span>
      <a href="courses.html" style="color: inherit; text-decoration: none;">Catalog</a>
      <span>/</span>
      <span style="color: #fff;">${course.title}</span>
    </div>

    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 48px;">
      <!-- Main Info -->
      <div>
        <span class="badge badge-success" style="margin-bottom: 16px;">${course.category}</span>
        <h1 style="font-size: 2.8rem; margin-bottom: 16px; line-height: 1.2;">${course.title}</h1>
        
        <div style="display: flex; gap: 24px; color: var(--text-secondary); margin-bottom: 32px; font-size: 0.95rem;">
          <span>Created by <strong style="color: #fff;">${course.instructor ? course.instructor.name : 'Instructor'}</strong></span>
          <span>•</span>
          <span>Updated ${new Date(course.createdAt).toLocaleDateString()}</span>
        </div>

        <img
          src="${course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}"
          alt="${course.title}"
          style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 16px; margin-bottom: 40px; border: 1px solid var(--border-color);"
        />

        <h2 style="font-size: 1.6rem; margin-bottom: 16px;">About This Course</h2>
        <p style="color: var(--text-secondary); font-size: 1.05rem; line-height: 1.7; margin-bottom: 40px; white-space: pre-wrap;">${course.description}</p>

        <h2 style="font-size: 1.6rem; margin-bottom: 20px;">Course Syllabus</h2>
        ${lessons.length === 0 ? `
          <div style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.1); padding: 24px; border-radius: 12px; color: var(--text-secondary);">
            ${isEnrolled 
              ? 'No lessons have been uploaded for this course yet.'
              : 'Syllabus content is locked. Please purchase or enroll in this course to view the syllabus and lessons.'
            }
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${lessons.map((lesson, idx) => `
              <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-radius: 10px;">
                <div style="display: flex; align-items: center; gap: 16px;">
                  <span style="font-size: 1.1rem; font-weight: 700; color: var(--primary);">${idx + 1}</span>
                  <span style="font-weight: 600;">${lesson.title}</span>
                </div>
                ${isEnrolled ? `
                  <span style="font-size: 0.85rem; color: var(--secondary); display: flex; align-items: center; gap: 4px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg> Available
                  </span>
                ` : ''}
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Pricing & Enrollment Sidebar Widget -->
      <div>
        <div class="glass-card" style="padding: 32px; position: sticky; top: 100px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
            <span style="font-size: 2.2rem; font-weight: 800; color: #fff;">
              ${course.price > 0 ? `₹${course.price}` : 'Free'}
            </span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 16px; color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 32px;">
            <div style="display: flex; justify-content: space-between;">
              <span>Total Lessons:</span>
              <span style="color: #fff; font-weight: 600;">${lessons.length} lessons</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Language:</span>
              <span style="color: #fff; font-weight: 600;">English</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Access:</span>
              <span style="color: #fff; font-weight: 600;">Lifetime access</span>
            </div>
          </div>

          <div id="enrollment-action-area">
            ${renderEnrollmentButton(user)}
          </div>

          <div style="margin-top: 24px; border-top: 1px solid var(--border-color); padding-top: 20px; font-size: 0.8rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; gap: 8px; align-items: center;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>30-Day Money-Back Guarantee</span>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8" r="7"></circle>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
              </svg>
              <span>Certificate of Completion</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  bindEvents();
}

function renderEnrollmentButton(user) {
  if (!user) {
    return `<a href="login.html" class="btn btn-primary" style="width: 100%; padding: 14px; text-align: center;">Sign In to Enroll</a>`;
  }
  if (isEnrolled) {
    return `<a href="learning.html?courseId=${course.id}" class="btn btn-secondary" style="width: 100%; padding: 14px; text-align: center;">Start Learning</a>`;
  }
  if (course.price > 0) {
    return `<button id="buy-course-btn" class="btn btn-primary" style="width: 100%; padding: 14px;">Buy Course</button>`;
  }
  return `<button id="enroll-free-btn" class="btn btn-primary" style="width: 100%; padding: 14px;">Enroll Now (Free)</button>`;
}

function bindEvents() {
  const buyBtn = document.getElementById('buy-course-btn');
  if (buyBtn) {
    buyBtn.addEventListener('click', handleBuyCourse);
  }

  const freeBtn = document.getElementById('enroll-free-btn');
  if (freeBtn) {
    freeBtn.addEventListener('click', handleEnrollFree);
  }
}

async function handleEnrollFree() {
  try {
    await apiFetch('/enrollments/enroll-free', {
      method: 'POST',
      body: { courseId: course.id }
    });
    alert('Enrolled successfully!');
    isEnrolled = true;
    window.location.href = `learning.html?courseId=${course.id}`;
  } catch (err) {
    alert(err.data || err.message || 'Failed to enroll');
  }
}

async function handleBuyCourse() {
  const user = getUser();
  if (!window.Razorpay) {
    alert('Failed to load Razorpay SDK. Check your internet connection.');
    return;
  }

  try {
    // 1. Create order on backend
    const orderData = await apiFetch('/payments/create-order', {
      method: 'POST',
      body: { courseId: course.id }
    });

    // 2. Open Razorpay Checkout options
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: Math.round(orderData.amount * 100),
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

          const verifyRes = await apiFetch('/payments/verify', {
            method: 'POST',
            body: verificationPayload
          });

          if (verifyRes.verified) {
            alert('Payment verified! Welcome to the course.');
            isEnrolled = true;
            window.location.href = `learning.html?courseId=${course.id}`;
          } else {
            alert('Payment signature verification failed.');
          }
        } catch (verifyError) {
          alert('Verification request failed.');
        }
      },
      prefill: {
        name: user ? user.name : '',
        email: user ? user.email : '',
      },
      theme: {
        color: '#6366f1'
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (err) {
    console.error(err);
    alert(err.message || 'Order creation failed');
  }
}
