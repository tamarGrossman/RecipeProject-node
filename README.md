# Recipe API Documentation

Base URL: `http://localhost:3000`

Authentication:
- Protected endpoints require header: `Authorization: Bearer <token>`
- `optionalAuth` means the endpoint also works without a token, but may return more data for authenticated users.

## API Table

| # | Method | Endpoint | Auth | Description |
|---|---|---|---|---|
| 1 | POST | `/api/users/register` | No | Register a new user. |
| 2 | POST | `/api/users/login` | No | Login and receive JWT token. |
| 3 | GET | `/api/users` | Yes (`auth` + `admin`) | Get all users (without passwords). |
| 4 | DELETE | `/api/users/:id` | Yes (`auth` + `admin`) | Delete a user by id. |
| 5 | PATCH | `/api/users/:id/password` | Yes (`auth`) | Update user password (self or admin). |
| 6 | GET | `/api/recipes/preparation-time/:minutes` | `optionalAuth` | Get recipes with preparation time up to `minutes`. |
| 7 | GET | `/api/recipes` | `optionalAuth` | Get recipes list (supports `page`, `limit`, `search`). |
| 8 | GET | `/api/recipes/:id` | `optionalAuth` | Get one recipe by id (visibility rules applied). |
| 9 | POST | `/api/recipes` | Yes (`auth`) | Create a recipe (owner is current user). |
| 10 | PATCH | `/api/recipes/:id` | Yes (`auth`) | Update a recipe (owner or admin only). |
| 11 | DELETE | `/api/recipes/:id` | Yes (`auth`) | Delete a recipe (owner or admin only). |
| 12 | GET | `/api/categories` | `optionalAuth` | Get categories list (without recipe documents). |
| 13 | GET | `/api/categories/with-recipes` | `optionalAuth` | Get all categories with visible recipes. |
| 14 | GET | `/api/categories/:key/recipes` | `optionalAuth` | Get category by code/name and its visible recipes. |

## Quick Request Examples

### Register
```http
POST /api/users/register
Content-Type: application/json

{
  "username": "demoUser",
  "email": "demo@example.com",
  "password": "StrongPass123!",
  "address": "Tel Aviv"
}
```

### Login
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "demo@example.com",
  "password": "StrongPass123!"
}
```

### Protected Request Example
```http
GET /api/users
Authorization: Bearer <token>
```
