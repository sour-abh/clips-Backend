# Clips Backend API

A robust, feature-rich backend service for video clip management with authentication, streaming, and storage capabilities. Built with Express.js, MongoDB, and TypeScript, this service allows users to upload, manage, and stream video content with full user authentication and authorization.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Error Handling](#error-handling)

## ✨ Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Video Management**: Upload, retrieve, update, and delete video clips
- **Video Streaming**: Adaptive streaming with FFmpeg re-encoding
- **GridFS Storage**: Efficient large file storage using MongoDB GridFS
- **Access Control**: Public and private clip visibility management
- **Pagination**: Optimized list queries with pagination support
- **Rate Limiting**: Built-in API rate limiting for security
- **View Tracking**: Automatic view count tracking for each clip
- **User-specific Clips**: Filter clips by user or retrieve personal clips
- **Security**: CORS, helmet for security headers, password hashing with bcrypt

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Storage**: MongoDB GridFS for video files
- **Authentication**: JWT (JSON Web Tokens)
- **Streaming**: FFmpeg for video re-encoding
- **Security**: 
  - bcryptjs for password hashing
  - helmet for HTTP headers security
  - express-rate-limit for rate limiting
  - CORS for cross-origin requests

## 📦 Prerequisites

Before running this application, ensure you have:

- Node.js 16.x or higher
- MongoDB 5.0 or higher (local or cloud instance)
- FFmpeg installed on your system
- npm or yarn package manager

### Installing FFmpeg

**Windows (using Chocolatey)**:
```powershell
choco install ffmpeg
```

**macOS (using Homebrew)**:
```bash
brew install ffmpeg
```

**Linux (Ubuntu/Debian)**:
```bash
sudo apt-get install ffmpeg
```

## 📥 Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd clips
```

2. **Install dependencies**:
```bash
npm install
```

## ⚙️ Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# CORS Configuration (if needed)
CLIENT_URL=http://localhost:3000
```

### Environment Variables Explanation

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key for JWT signing | `your_secure_secret_key` |

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Build TypeScript
```bash
npm run build
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or the PORT specified in your `.env` file).

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)

#### Register User
- **Endpoint**: `POST /api/auth/register`
- **Description**: Create a new user account
- **Authentication**: None
- **Request Body**:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```
- **Success Response** (201):
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

#### Login User
- **Endpoint**: `POST /api/auth/login`
- **Description**: Authenticate user and get JWT token
- **Authentication**: None
- **Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```
- **Success Response** (200):
```json
{
  "message": "login Successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

#### Get Current User
- **Endpoint**: `GET /api/auth/me`
- **Description**: Retrieve authenticated user's profile
- **Authentication**: Required (Bearer Token)
- **Headers**: `Authorization: Bearer <token>`
- **Success Response** (200):
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

---

### Clips Routes (`/api/clips`)

#### Upload Video Clip
- **Endpoint**: `POST /api/clips/upload`
- **Description**: Upload a new video clip
- **Authentication**: Required (Bearer Token)
- **Content-Type**: multipart/form-data
- **Request Parameters**:
  - `video` (file, required): Video file
  - `title` (string, required): Clip title
  - `description` (string, optional): Clip description
  - `tags` (JSON string, optional): Array of tags
  - `isPublic` (boolean, optional): Default is true
- **Example**:
```bash
curl -X POST http://localhost:5000/api/clips/upload \
  -H "Authorization: Bearer <token>" \
  -F "video=@video.mp4" \
  -F "title=My Awesome Clip" \
  -F "description=This is a test clip" \
  -F "tags=[\"sports\", \"action\"]" \
  -F "isPublic=true"
```
- **Success Response** (201):
```json
{
  "message": "clip uploaded successfully",
  "clip": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "title": "My Awesome Clip",
    "description": "This is a test clip",
    "tags": ["sports", "action"],
    "isPublic": true,
    "views": 0,
    "size": 5242880,
    "createdAt": "2025-12-12T10:30:00Z"
  }
}
```

#### Get All Clips (Paginated)
- **Endpoint**: `GET /api/clips`
- **Description**: Retrieve all public clips and user's private clips
- **Authentication**: Optional (Bearer Token)
- **Query Parameters**:
  - `page` (number, optional): Page number, default 1
  - `limit` (number, optional): Items per page, default 20
- **Example**:
```bash
curl http://localhost:5000/api/clips?page=1&limit=10
```
- **Success Response** (200):
```json
{
  "clips": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "My Awesome Clip",
      "description": "This is a test clip",
      "userId": {
        "_id": "507f1f77bcf86cd799439012",
        "username": "johndoe"
      },
      "views": 5,
      "tags": ["sports", "action"],
      "isPublic": true,
      "createdAt": "2025-12-12T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

#### Get User's Clips
- **Endpoint**: `GET /api/clips/user/:userId`
- **Description**: Retrieve all public clips from a specific user
- **Authentication**: Optional (Bearer Token)
- **Path Parameters**:
  - `userId` (string): User ID
- **Query Parameters**:
  - `page` (number, optional): Page number, default 1
  - `limit` (number, optional): Items per page, default 20
- **Example**:
```bash
curl http://localhost:5000/api/clips/user/507f1f77bcf86cd799439012?page=1&limit=10
```
- **Success Response** (200):
```json
{
  "clips": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 12,
    "pages": 2
  }
}
```

#### Get My Clips
- **Endpoint**: `GET /api/clips/my-clips`
- **Description**: Retrieve all clips uploaded by the authenticated user
- **Authentication**: Required (Bearer Token)
- **Query Parameters**:
  - `page` (number, optional): Page number, default 1
  - `limit` (number, optional): Items per page, default 20
- **Example**:
```bash
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/clips/my-clips?page=1&limit=10
```
- **Success Response** (200):
```json
{
  "clips": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

#### Get Clip Details
- **Endpoint**: `GET /api/clips/:id`
- **Description**: Retrieve a specific clip with view count increment
- **Authentication**: Optional (Bearer Token)
- **Path Parameters**:
  - `id` (string): Clip ID
- **Example**:
```bash
curl http://localhost:5000/api/clips/507f1f77bcf86cd799439011
```
- **Success Response** (200):
```json
{
  "clip": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "My Awesome Clip",
    "description": "This is a test clip",
    "userId": {
      "_id": "507f1f77bcf86cd799439012",
      "username": "johndoe"
    },
    "views": 6,
    "tags": ["sports", "action"],
    "isPublic": true,
    "size": 5242880,
    "createdAt": "2025-12-12T10:30:00Z"
  }
}
```

#### Update Clip
- **Endpoint**: `PUT /api/clips/:id`
- **Description**: Update clip metadata (title, description, tags, visibility)
- **Authentication**: Required (Bearer Token)
- **Path Parameters**:
  - `id` (string): Clip ID
- **Request Body**:
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "tags": ["new", "tags"],
  "isPublic": false
}
```
- **Success Response** (200):
```json
{
  "message": "clip updated Successfully",
  "clip": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Updated Title",
    "description": "Updated description",
    "tags": ["new", "tags"],
    "isPublic": false
  }
}
```

#### Delete Clip
- **Endpoint**: `DELETE /api/clips/:id`
- **Description**: Delete a clip and its video file
- **Authentication**: Required (Bearer Token)
- **Path Parameters**:
  - `id` (string): Clip ID
- **Example**:
```bash
curl -X DELETE -H "Authorization: Bearer <token>" http://localhost:5000/api/clips/507f1f77bcf86cd799439011
```
- **Success Response** (200):
```json
{
  "message": "Clip deleted Successfully"
}
```

#### Stream Video
- **Endpoint**: `GET /api/clips/stream/:id`
- **Description**: Stream a video clip with adaptive bitrate
- **Authentication**: Not required
- **Path Parameters**:
  - `id` (string): Clip ID
- **Example**:
```html
<video width="640" height="480" controls>
  <source src="http://localhost:5000/api/clips/stream/507f1f77bcf86cd799439011" type="video/mp4">
  Your browser does not support the video tag.
</video>
```
- **Response**: Video stream (MP4 format)

---

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration
- JWT tokens expire in **7 days**
- Users must re-login or refresh their token after expiration

---

## ⚠️ Error Handling

The API returns standardized error responses:

### Common Error Status Codes

| Status Code | Meaning | Example Response |
|------------|---------|------------------|
| 400 | Bad Request | `{"message": "User already exists"}` |
| 401 | Unauthorized | `{"message": "Invalid credentials"}` |
| 403 | Forbidden | `{"message": "Access denied"}` |
| 404 | Not Found | `{"message": "Clip not found"}` |
| 500 | Server Error | `{"message": "Something went wrong!"}` |

### Rate Limiting
- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## 📝 Notes

- Maximum upload file size: **10MB**
- Video streaming uses FFmpeg for real-time re-encoding and adaptive streaming
- Ensure MongoDB GridFS is properly configured for large video storage
- Store JWT tokens securely in your client application
- Implement token refresh mechanism for better security

## 📄 License

ISC

## 👨‍💻 Author

Developed by the Clips Backend Team
