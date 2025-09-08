# 🚀 X-Blog

X-Blog is a full-featured blogging platform built with **Node.js**, **Express**, **MongoDB**, and **JWT authentication**.  
It allows users to create, manage, and share blog posts with features like likes, comments, tags, bookmarks, and followers.

---

## 👤 Author
**Mohammed Sadiq**

---

## ✨ Features
- 🔑 User authentication (register, login, logout, JWT access/refresh)
- 📝 Post creation, update, delete with image upload
- 👍 Like & 💬 Comment system
- 🏷️ Tags management
- ⭐ Bookmark posts
- 👥 Follow/unfollow users
- 📄 User profile with avatar update
- 🔐 Secure password change & email verification

---

## 📌 API Routes

### 🔑 User Routes (`/api/v1/users`)
- `POST /register` → Register a new user (with avatar upload)  
- `POST /login` → Login user  
- `POST /logout` → Logout user (auth required)  
- `POST /update-avatar` → Update avatar (auth required, file upload)  
- `PUT /change-password` → Change password (auth required)  
- `POST /access-token` → Refresh access token  
- `POST /verify-email` → Verify user email  
- `GET /me` → Get current user profile (auth required)  
- `GET /:id` → Get user by ID (auth required)  
- `GET /by-username/:username` → Get user by username (auth required)  

---

### 📝 Post Routes (`/api/v1/posts`)
- `POST /` → Create new post (auth + image upload)  
- `GET /` → Get all posts  
- `GET /search/:title` → Search posts by title  
- `GET /me` → Get posts of logged-in user  
- `GET /:id` → Get single post by ID  
- `PUT /:id` → Update post (auth + image upload)  
- `DELETE /:id` → Delete post  

**Likes**
- `POST /:postId/like` → Like a post  
- `DELETE /:postId/dislike` → Remove like  
- `GET /:postId/likes` → Get likes on a post  

**Comments**
- `POST /:postId/comments` → Add comment  
- `GET /:postId/comments` → Get comments on post  
- `PUT /comments/:commentId` → Update comment  
- `DELETE /comments/:commentId` → Remove comment  

---

### 🏷️ Tag Routes (`/api/v1/tags`)
- `POST /:postId/tags` → Add a tag to post  
- `DELETE /:postId/tags/:tagId` → Delete a tag from post  
- `PUT /:postId/tags/:tagId` → Update a tag  
- `GET /:search` → Search tags  
- `GET /tag/filter` → Filter tags  

---

### ⭐ Bookmark Routes (`/api/v1/bookmarks`)
- `POST /bookmark/:postId` → Add bookmark  
- `DELETE /bookmark/:postId` → Remove bookmark  
- `GET /bookmark` → Get all bookmarks for user  

---

### 👥 Follower Routes (`/api/v1/followers`)
- `POST /follow/:userId` → Follow a user  
- `DELETE /follow/:userId` → Unfollow a user  

---

## ⚙️ Installation

Clone the repo and install dependencies:

```bash
git clone https://github.com/DSAwithCode00/X-Blog.git
cd X-Blog/Backend
npm install
