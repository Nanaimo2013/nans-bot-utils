# API Reference

Nans Bot Utils provides a REST API for external integrations and advanced server management.

## Base URL

\`\`\`
https://your-domain.com/api
\`\`\`

## Authentication

All API requests require authentication using a server API key.

### Getting an API Key

1. Go to your server dashboard
2. Navigate to Settings → API
3. Generate a new API key
4. Keep this key secure and never share it publicly

### Authentication Header

Include your API key in all requests:

\`\`\`http
Authorization: Bearer YOUR_API_KEY
\`\`\`

## Rate Limiting

API requests are rate limited to prevent abuse:

- **Standard endpoints:** 100 requests per minute
- **Moderation endpoints:** 50 requests per minute
- **Bulk operations:** 10 requests per minute

Rate limit headers are included in responses:
\`\`\`http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
\`\`\`

## Endpoints

### Server Information

#### GET `/api/server/{serverId}`

Get basic server information.

**Parameters:**
- `serverId` (path) - Discord server ID

**Response:**
\`\`\`json
{
  "id": "123456789012345678",
  "name": "My Discord Server",
  "memberCount": 1250,
  "botEnabled": true,
  "features": ["MODERATION", "ECONOMY", "LEVELING"],
  "settings": {
    "prefix": "!",
    "language": "en"
  }
}
\`\`\`

### Members

#### GET `/api/server/{serverId}/members`

Get server member list with pagination.

**Parameters:**
- `serverId` (path) - Discord server ID
- `page` (query) - Page number (default: 1)
- `limit` (query) - Items per page (max: 100, default: 50)

**Response:**
\`\`\`json
{
  "members": [
    {
      "id": "123456789012345678",
      "username": "user123",
      "discriminator": "1234",
      "avatar": "avatar_hash",
      "joinedAt": "2023-01-15T10:30:00Z",
      "level": 15,
      "xp": 2500,
      "balance": 1000
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1250,
    "pages": 25
  }
}
\`\`\`

#### GET `/api/server/{serverId}/members/{userId}`

Get detailed information about a specific member.

**Parameters:**
- `serverId` (path) - Discord server ID
- `userId` (path) - Discord user ID

**Response:**
\`\`\`json
{
  "id": "123456789012345678",
  "username": "user123",
  "discriminator": "1234",
  "avatar": "avatar_hash",
  "joinedAt": "2023-01-15T10:30:00Z",
  "roles": ["role1", "role2"],
  "level": 15,
  "xp": 2500,
  "balance": 1000,
  "warnings": 2,
  "lastActive": "2023-12-01T15:45:00Z"
}
\`\`\`

### Moderation

#### POST `/api/server/{serverId}/moderation/warn`

Issue a warning to a user.

**Parameters:**
- `serverId` (path) - Discord server ID

**Request Body:**
\`\`\`json
{
  "userId": "123456789012345678",
  "reason": "Inappropriate language",
  "moderatorId": "987654321098765432"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "warningId": "warn_123456",
  "totalWarnings": 3
}
\`\`\`

#### GET `/api/server/{serverId}/moderation/warnings/{userId}`

Get warnings for a specific user.

**Parameters:**
- `serverId` (path) - Discord server ID
- `userId` (path) - Discord user ID

**Response:**
\`\`\`json
{
  "userId": "123456789012345678",
  "totalWarnings": 3,
  "warnings": [
    {
      "id": "warn_123456",
      "reason": "Inappropriate language",
      "moderatorId": "987654321098765432",
      "createdAt": "2023-12-01T10:30:00Z"
    }
  ]
}
\`\`\`

#### POST `/api/server/{serverId}/moderation/ban`

Ban a user from the server.

**Request Body:**
\`\`\`json
{
  "userId": "123456789012345678",
  "reason": "Repeated violations",
  "moderatorId": "987654321098765432",
  "deleteDays": 7
}
\`\`\`

### Economy

#### GET `/api/server/{serverId}/economy/balance/{userId}`

Get user's economy balance.

**Response:**
\`\`\`json
{
  "userId": "123456789012345678",
  "balance": 1500,
  "bank": 5000,
  "total": 6500,
  "lastDaily": "2023-12-01T00:00:00Z",
  "lastWork": "2023-12-01T14:30:00Z"
}
\`\`\`

#### POST `/api/server/{serverId}/economy/transfer`

Transfer money between users.

**Request Body:**
\`\`\`json
{
  "fromUserId": "123456789012345678",
  "toUserId": "987654321098765432",
  "amount": 500,
  "reason": "Payment for services"
}
\`\`\`

#### GET `/api/server/{serverId}/economy/leaderboard`

Get economy leaderboard.

**Parameters:**
- `type` (query) - Leaderboard type (balance, total, level)
- `limit` (query) - Number of entries (max: 100, default: 10)

**Response:**
\`\`\`json
{
  "leaderboard": [
    {
      "rank": 1,
      "userId": "123456789012345678",
      "username": "user123",
      "value": 15000
    }
  ]
}
\`\`\`

### Leveling

#### GET `/api/server/{serverId}/leveling/user/{userId}`

Get user's level information.

**Response:**
\`\`\`json
{
  "userId": "123456789012345678",
  "level": 15,
  "xp": 2500,
  "xpToNext": 1000,
  "totalXp": 12500,
  "rank": 25
}
\`\`\`

#### POST `/api/server/{serverId}/leveling/add-xp`

Add XP to a user.

**Request Body:**
\`\`\`json
{
  "userId": "123456789012345678",
  "amount": 100,
  "reason": "Event participation"
}
\`\`\`

### Logs

#### GET `/api/server/{serverId}/logs`

Get server logs with filtering.

**Parameters:**
- `type` (query) - Log type (moderation, member, message, server)
- `startDate` (query) - Start date (ISO 8601)
- `endDate` (query) - End date (ISO 8601)
- `page` (query) - Page number
- `limit` (query) - Items per page (max: 100)

**Response:**
\`\`\`json
{
  "logs": [
    {
      "id": "log_123456",
      "type": "moderation",
      "action": "ban",
      "userId": "123456789012345678",
      "moderatorId": "987654321098765432",
      "reason": "Spam",
      "timestamp": "2023-12-01T15:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 500,
    "pages": 10
  }
}
\`\`\`

## Webhooks

Configure webhooks to receive real-time notifications about server events.

### Setting Up Webhooks

1. Go to your server dashboard
2. Navigate to Settings → Webhooks
3. Add a new webhook URL
4. Select events to receive

### Webhook Events

- `member.join` - New member joined
- `member.leave` - Member left
- `moderation.warn` - Warning issued
- `moderation.ban` - User banned
- `economy.transaction` - Economy transaction
- `level.up` - User leveled up

### Webhook Payload

\`\`\`json
{
  "event": "member.join",
  "serverId": "123456789012345678",
  "timestamp": "2023-12-01T15:30:00Z",
  "data": {
    "userId": "987654321098765432",
    "username": "newuser",
    "joinedAt": "2023-12-01T15:30:00Z"
  }
}
\`\`\`

## Error Handling

API errors return appropriate HTTP status codes with error details:

\`\`\`json
{
  "error": {
    "code": "INVALID_USER",
    "message": "User not found in server",
    "details": "The specified user ID does not exist in this server"
  }
}
\`\`\`

### Common Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error

## SDKs and Libraries

Official SDKs are available for popular programming languages:

- **JavaScript/Node.js:** `npm install nans-bot-api`
- **Python:** `pip install nans-bot-api`
- **PHP:** `composer require nans-bot/api`

### JavaScript Example

\`\`\`javascript
const NansBotAPI = require('nans-bot-api');

const api = new NansBotAPI('YOUR_API_KEY');

// Get server info
const server = await api.getServer('123456789012345678');

// Issue a warning
await api.warnUser('123456789012345678', {
  userId: '987654321098765432',
  reason: 'Inappropriate behavior'
});
\`\`\`

## Support

For API support:
- Check the [troubleshooting guide](/docs/troubleshooting)
- Join our [Discord server](https://discord.gg/your-server)
- Email: api-support@your-domain.com

---

**Rate limits and endpoints may change. Always check the latest documentation.**
