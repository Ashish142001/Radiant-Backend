## User Authentication & Session Management
This project implements a secure, scalable user authentication and session management system using Node.js, Express, MongoDB, and Redis

## Tech Stack
- Backend: Node.js, Express.js
- Database: MongoDB (Mongoose)
- Session Store: Redis
- Email Service: Nodemailer
- Validation: express-validator
- Password Hashing: bcrypt
- Logging: winston
- Testing: Jest

## Install Dependencies
- npm install

## Set Environment Variables Create a .env file in root:

- PORT=5000
- MONGO_URI=mongodb://localhost:27017/auth_demo
- REDIS_HOST=127.0.0.1
- REDIS_PORT=6379
- SESSION_SECRET=yourSecret
- EMAIL_USER=your@email.com
- EMAIL_PASS=yourpassword
- BASE_URL=http://localhost:5000


## Run App
 - npm start


## Security Measures
- Password hashing with bcrypt & salting.
- Input validation & sanitization with express-validator.
- Session storage in Redis with expiration handling.
- Recommend running over HTTPS in production.
- Avoid storing sensitive tokens in plain text.

 ## Logging
- Uses winston for logging authentication activities.
- Logs events like successful logins, failed attempts, password reset requests, and session terminations.
- Logs stored in logs/ directory.

## Testing
- Unit tests for controller functions & services.
- Integration tests for API endpoints.
- Uses Jest or Mocha & Supertest for testing.

## Run tests:

- npm run test 



