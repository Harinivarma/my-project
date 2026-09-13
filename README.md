# AI-Powered Learning Marketplace

A comprehensive, production-ready full-stack learning platform styled like Udemy, enabling instructors to host courses, students to purchase classes securely via **Razorpay**, take **AI-Generated MCQ Quizzes**, and receive **explainable NLP course recommendations**.

---

## Technology Stack

* **Frontend**: React.js, Axios, React Router, Vite, Vanilla CSS
* **Backend**: Java, Spring Boot, Spring Security, Spring Data JPA, Hibernate, Maven
* **Database**: MySQL
* **NLP engine**: Apache OpenNLP (TF-IDF Vector Cosine Similarity)
* **Quiz Generation**: Gemini 1.5 Flash API via Java HttpClient
* **Payments Gateway**: Razorpay SDK & Signature Verification (HMAC-SHA256)

---

## System Architecture

```text
React.js Frontend (Port 3000)
        │
        │ REST API (JSON + JWT Bearer Token)
        ▼
Spring Boot Backend (Port 8080)
        │
        ├──► Security & JWT (BCrypt, Custom JwtAuthenticationFilter)
        ├──► MySQL Database (JPA/Hibernate)
        ├──► Razorpay Integration (Order generation from DB price, HMAC-SHA256 verification)
        ├──► Java NLP Engine (Apache OpenNLP Tokenizer + TF-IDF Vector Cosine Similarity)
        └──► AI Quiz API (Spring Boot REST Client -> Gemini/OpenAI API)
```

---

## Database Design

The schema has been normalized into 10 primary tables with constraints, indexes, and a clean `Course -> Lesson` content structure:

1. **`users`**: Platform accounts (Name, Email, BCrypt Password, Role: STUDENT/INSTRUCTOR/ADMIN, Interests keywords, Skills acquired list).
2. **`courses`**: Course listings (Title, Description, Category, skills tags, price, thumbnail, approved flag, instructor).
3. **`lessons`**: Syllabus content units (Course, Title, video url, markdown notes, sequence order).
4. **`enrollments`**: Enrollment ledger (Student, Course, timestamp).
5. **`orders`**: Razorpay transaction identifiers (Order ID, Student, Course, price, status: CREATED/PAID/FAILED).
6. **`payments`**: Successful payment signatures (Order, Payment ID, cryptographic signature, status).
7. **`lesson_progress`**: Individual course module tracking (Student, Course, Lesson, completed boolean).
8. **`quizzes`**: Quiz templates (Course, Title).
9. **`quiz_questions`**: MCQ questions (Quiz, Question text, options A-D, correctAnswer letter, AI explanation text).
10. **`quiz_attempts`**: Quiz grading logs (Student, Quiz, score, total questions count).

---

## Central REST APIs

### Authentication
* `POST /api/auth/register` - Create user profile
* `POST /api/auth/login` - Authenticate credentials, returns JWT
* `GET /api/auth/profile` - Read profile data
* `PUT /api/auth/profile` - Edit interests topics

### Course Catalog
* `GET /api/courses` - Search/Filter approved courses
* `GET /api/courses/{id}` - Details of specific course
* `POST /api/courses` - Create course (Instructor only)
* `PUT /api/courses/{id}` - Modify course (Instructor owner check)
* `DELETE /api/courses/{id}` - Remove course (Instructor owner or Admin check)

### Course Content
* `GET /api/courses/{id}/lessons` - Syllabus lessons (Enrolls protection checks)
* `POST /api/courses/{id}/lessons` - Add lesson (Instructor owner check)
* `DELETE /api/courses/lessons/{lessonId}` - Remove lesson (Instructor owner check)

### Payments
* `POST /api/payments/create-order` - Generate Razorpay Order ID from course price
* `POST /api/payments/verify` - Secure HMAC-SHA256 signature check & enroll

### Recommendation Engine
* `GET /api/recommendations` - Personal explainable matching scores

### Quiz Systems
* `POST /api/quizzes/generate` - Instructs Gemini to draft MCQs from notes (Instructor owner check)
* `GET /api/quizzes/course/{courseId}` - View quizzes for course
* `GET /api/quizzes/{quizId}/questions` - Fetch quiz questions
* `POST /api/quizzes/{quizId}/attempt` - Submit answers and log attempt
* `GET /api/quizzes/{quizId}/attempts` - Retrieve previous attempts

### Admin Dashboards
* `GET /api/admin/users` - Moderate user roles
* `DELETE /api/admin/users/{id}` - Ban user account
* `GET /api/admin/courses` - Review all course details
* `POST /api/admin/courses/{id}/approve` - Approve course publication
* `GET /api/admin/orders` - Platform payment ledgers
* `GET /api/admin/statistics` - Monitor student signups and revenue

---

## Setup Instructions

### Prerequisites
* Java JDK 17
* Maven 3.x
* MySQL Server (running on default port 3306)
* Node.js & npm (v18+)

### 1. Database Setup
Execute the table creation scripts from [database/schema.sql](file:///c:/LEARNINGMANAGEMENTSYSTEMNEW/database/schema.sql) in your MySQL instance:
```bash
mysql -u root -p < database/schema.sql
```
This automatically configures the database `lms_db` and seeds three default accounts (password is `password123`):
* **Admin**: `admin@lms.com`
* **Instructor**: `instructor@lms.com`
* **Student**: `student@lms.com`

### 2. Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create your `.env` file from the example:
   ```bash
   copy .env.example .env
   ```
   Modify details with your database credentials, JWT secret key, Razorpay API secret key, and Google Gemini API keys.
3. Build the project using Maven:
   ```bash
   mvn clean install
   ```
4. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   The backend API will run on `http://localhost:8080`.

### 3. Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd ../frontend
   ```
2. Create your `.env` file from the example:
   ```bash
   copy .env.example .env
   ```
   Configure `VITE_RAZORPAY_KEY_ID` with your public Razorpay test credential key.
3. Install packages:
   ```bash
   npm install
   ```
4. Run the Vite development server:
   ```bash
   npm run dev
   ```
   The user interface will boot up on `http://localhost:5173` (or `http://localhost:3000` depending on ports availability).
