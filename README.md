# Movie Rate API

This API allows authenticated users to rate movies (or series, and other types of media in the future). Users must be authenticated via JWT (JSON Web Token) to access protected endpoints such as creating, updating, or deleting reviews.

## Features

- **JWT-based Authentication**: Secure user registration and login
- **Movie CRUD Operations**: Create, read, update, and delete movies
- **Review System**: Users can submit ratings and comments for movies
- **Duplicate Prevention**: Users cannot review the same movie twice
- **Search & Filter**: Find movies by genre, release date, rating, or text search
- **SQLite Database**: Simple, file-based database perfect for development

## Tech Stack

- **Node.js** with **Express.js**
- **Sequelize ORM** with **SQLite**
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Jest** and **Supertest** for testing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd movie-rate-api
```

2. Install dependencies:
```bash
npm install
```

3. Seed the database with sample data (optional):
```bash
npm run seed
```

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Testing

Run the test suite:
```bash
npm test
```

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Both endpoints return:
```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

### Movies

#### Get All Movies (with search/filter)
```http
GET /api/movies
GET /api/movies?genre=Action
GET /api/movies?search=Batman
GET /api/movies?minRating=4&maxRating=5
GET /api/movies?releaseYear=2008
GET /api/movies?page=1&limit=10
```

#### Get Movie by ID
```http
GET /api/movies/:id
```

#### Create Movie (Protected)
```http
POST /api/movies
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "The Dark Knight",
  "description": "Batman raises the stakes...",
  "genre": "Action",
  "releaseDate": "2008-07-18",
  "director": "Christopher Nolan",
  "duration": 152
}
```

#### Update Movie (Protected)
```http
PUT /api/movies/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "genre": "Updated Genre"
}
```

#### Delete Movie (Protected)
```http
DELETE /api/movies/:id
Authorization: Bearer <token>
```

### Reviews

#### Get Reviews for a Movie
```http
GET /api/reviews/movie/:movieId
GET /api/reviews/movie/:movieId?page=1&limit=10
```

#### Get User's Reviews (Protected)
```http
GET /api/reviews/user/:userId
Authorization: Bearer <token>
```

#### Create Review (Protected)
```http
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "movieId": 1,
  "rating": 5,
  "comment": "Absolutely amazing movie!"
}
```

#### Update Review (Protected)
```http
PUT /api/reviews/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 4,
  "comment": "Updated my review"
}
```

#### Delete Review (Protected)
```http
DELETE /api/reviews/:id
Authorization: Bearer <token>
```

## Example Usage

1. **Register a new user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

2. **Login and get token:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

3. **Create a movie:**
```bash
curl -X POST http://localhost:3000/api/movies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"Test Movie","genre":"Drama","releaseDate":"2023-01-01"}'
```

4. **Create a review:**
```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"movieId":1,"rating":5,"comment":"Great movie!"}'
```

5. **Search movies:**
```bash
curl "http://localhost:3000/api/movies?search=batman&genre=action"
```

## Database Schema

### Users
- `id` (Primary Key)
- `username` (Unique)
- `email` (Unique)
- `password` (Hashed)
- `createdAt`, `updatedAt`

### Movies
- `id` (Primary Key)
- `title`
- `description`
- `genre`
- `releaseDate`
- `director`
- `duration` (in minutes)
- `averageRating` (calculated)
- `totalReviews` (calculated)
- `createdAt`, `updatedAt`

### Reviews
- `id` (Primary Key)
- `userId` (Foreign Key to Users)
- `movieId` (Foreign Key to Movies)
- `rating` (1-5)
- `comment`
- `createdAt`, `updatedAt`
- Unique constraint on `(userId, movieId)` to prevent duplicates

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: express-validator for request validation
- **CORS**: Cross-origin resource sharing configured
- **Helmet**: Security headers middleware

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials)
- `403` - Forbidden (invalid/expired token)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

Example error response:
```json
{
  "error": "You have already reviewed this movie"
}
```

## Contributing

This is a student project designed to be simple and educational. Feel free to suggest improvements or add features!

## License

ISC
