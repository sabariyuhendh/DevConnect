# DevConnect API Documentation

This document outlines all API endpoints available in the DevConnect application.

## Authentication

### Login
- **Endpoint**: `POST /api/auth/login`
- **Description**: Authenticates a user and returns a JWT token
- **Usage**: Login page form submission
- **Payload**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```

### Sign Up
- **Endpoint**: `POST /api/auth/signup`
- **Description**: Creates a new user account
- **Usage**: Registration page form submission
- **Payload**:
  ```json
  {
    "email": "string",
    "password": "string",
    "name": "string",
    "username": "string"
  }
  ```

### Logout
- **Endpoint**: `POST /api/auth/logout`
- **Description**: Logs out the current user
- **Usage**: Navbar logout button click

## Posts

### Get Posts Feed
- **Endpoint**: `GET /api/posts`
- **Description**: Retrieves posts for the feed
- **Usage**: Feed page load, filter changes
- **Query Parameters**:
  ```
  filter: string
  page: number
  limit: number
  ```

### Get Single Post
- **Endpoint**: `GET /api/posts/:id`
- **Description**: Retrieves a specific post's details
- **Usage**: Post detail page load
- **URL Parameters**: `id` - Post identifier

### Create Post
- **Endpoint**: `POST /api/posts`
- **Description**: Creates a new post
- **Usage**: Create post page form submission
- **Payload**:
  ```json
  {
    "title": "string",
    "content": "string",
    "tags": "string[]"
  }
  ```

### Update Post
- **Endpoint**: `PUT /api/posts/:id`
- **Description**: Updates an existing post
- **Usage**: Edit post form submission
- **URL Parameters**: `id` - Post identifier
- **Payload**: Same as create post

### Like/Unlike Post
- **Endpoint**: 
  - Like: `POST /api/posts/:id/like`
  - Unlike: `DELETE /api/posts/:id/like`
- **Description**: Toggles like status on a post
- **Usage**: Like button click in post card

## Profile

### Get Profile
- **Endpoint**: `GET /api/profiles/:username`
- **Description**: Retrieves user profile information
- **Usage**: Profile page load
- **URL Parameters**: `username` - Profile username

### Update Profile
- **Endpoint**: `PUT /api/profiles`
- **Description**: Updates user profile information
- **Usage**: Settings page form submission
- **Payload**:
  ```json
  {
    "name": "string",
    "bio": "string",
    "location": "string",
    "skills": "string[]"
  }
  ```

### Follow/Unfollow
- **Endpoint**: 
  - Follow: `POST /api/profiles/:username/follow`
  - Unfollow: `DELETE /api/profiles/:username/follow`
- **Description**: Manages following relationship between users
- **Usage**: Follow/unfollow button click
- **URL Parameters**: `username` - Target user's username

## Jobs

### Get Jobs
- **Endpoint**: `GET /api/jobs`
- **Description**: Retrieves job listings
- **Usage**: Jobs page load, filter changes
- **Query Parameters**:
  ```
  search: string
  location: string
  type: string
  experience: string
  ```

### Apply for Job
- **Endpoint**: `POST /api/jobs/:id/apply`
- **Description**: Submits a job application
- **Usage**: Apply button click on job detail page
- **URL Parameters**: `id` - Job identifier

### Save/Unsave Job
- **Endpoint**: 
  - Save: `POST /api/jobs/:id/save`
  - Unsave: `DELETE /api/jobs/:id/save`
- **Description**: Manages saved jobs for a user
- **Usage**: Save job button click
- **URL Parameters**: `id` - Job identifier

## Events

### Get Events
- **Endpoint**: `GET /api/events`
- **Description**: Retrieves event listings
- **Usage**: Events page load
- **Query Parameters**:
  ```
  category: string
  type: string
  date: string
  ```

### Create Event
- **Endpoint**: `POST /api/events`
- **Description**: Creates a new event
- **Usage**: Create event form submission
- **Payload**:
  ```json
  {
    "title": "string",
    "description": "string",
    "date": "string",
    "location": "string",
    "type": "string"
  }
  ```

### RSVP to Event
- **Endpoint**: `POST /api/events/:id/rsvp`
- **Description**: Responds to event invitation
- **Usage**: RSVP button click
- **URL Parameters**: `id` - Event identifier
- **Payload**:
  ```json
  {
    "status": "string" // "going", "maybe", "not-going"
  }
  ```

## Messages

### Get Conversations
- **Endpoint**: `GET /api/messages/conversations`
- **Description**: Retrieves user's message conversations
- **Usage**: Messages page load

### Get Conversation Messages
- **Endpoint**: `GET /api/messages/conversations/:id`
- **Description**: Retrieves messages for a specific conversation
- **Usage**: Opening a conversation thread
- **URL Parameters**: `id` - Conversation identifier

### Send Message
- **Endpoint**: `POST /api/messages`
- **Description**: Sends a new message
- **Usage**: Message input form submission
- **Payload**:
  ```json
  {
    "conversationId": "string",
    "content": "string"
  }
  ```

## Analytics

### Get Overview
- **Endpoint**: `GET /api/analytics/overview`
- **Description**: Retrieves general analytics data
- **Usage**: Analytics dashboard page load

### Get Post Analytics
- **Endpoint**: `GET /api/analytics/posts`
- **Description**: Retrieves post-specific analytics
- **Usage**: Analytics dashboard posts section

### Get Engagement Analytics
- **Endpoint**: `GET /api/analytics/engagement`
- **Description**: Retrieves user engagement metrics
- **Usage**: Analytics dashboard engagement section

### Get Audience Analytics
- **Endpoint**: `GET /api/analytics/audience`
- **Description**: Retrieves audience demographic data
- **Usage**: Analytics dashboard audience section