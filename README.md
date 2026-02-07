# Online Appointment System

A full-stack appointment booking application with Spring Boot backend and React frontend.

## Features

- **User Features:**
  - User registration and login with JWT authentication
  - Book 1-hour appointment slots (24/7 availability)
  - View and manage own appointments
  - Cancel scheduled appointments

- **Admin Features:**
  - View all appointments
  - Delete any appointment
  - View all registered users

## Tech Stack

### Backend
- Spring Boot 3.2
- PostgreSQL Database
- Spring Security with JWT
- Spring Data JPA

### Frontend
- React 18
- React Router v6
- Axios for API calls
- CSS for styling

## Project Structure

```
TestKilo/
├── backend/
│   ├── src/main/java/com/appointment/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── entity/
│   │   ├── repository/
│   │   ├── security/
│   │   └── service/
│   └── src/main/resources/
│       └── application.yml
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Java 17 or higher
- Node.js and npm
- PostgreSQL database

### Backend Setup

1. **Create PostgreSQL Database:**
   ```sql
   CREATE DATABASE appointment_db;
   ```

2. **Configure Database:**
   Edit `backend/src/main/resources/application.yml` and update the PostgreSQL connection:
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/appointment_db
       username: your_postgres_username
       password: your_postgres_password
   ```

3. **Run Backend:**
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   
   The backend will start on `http://localhost:8080`

4. **Default Admin Account:**
   An admin account is created automatically:
   - Email: `admin@appointment.com`
   - Password: `admin123`

### Frontend Setup

1. **Install Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Frontend:**
   ```bash
   npm start
   ```
   
   The frontend will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/profile` - Get current user profile

### Appointments (User)
- `GET /api/appointments` - Get user's appointments
- `POST /api/appointments` - Create new appointment
- `GET /api/appointments/{id}` - Get specific appointment
- `DELETE /api/appointments/{id}` - Cancel appointment

### Appointments (Admin)
- `GET /api/admin/appointments` - Get all appointments
- `DELETE /api/admin/appointments/{id}` - Delete any appointment

### Users (Admin)
- `GET /api/admin/users` - Get all users

## Usage

1. Open `http://localhost:3000` in your browser
2. Register a new account or login with existing credentials
3. Navigate to "Book Appointment" to create a new appointment
4. View and manage appointments in "My Appointments"
5. Admin users can access the Admin Panel from the navigation

## Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## License

This project is for educational purposes.
