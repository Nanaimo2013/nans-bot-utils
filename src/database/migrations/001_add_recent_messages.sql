-- Add table for tracking recent messages for spam detection
CREATE TABLE IF NOT EXISTS recent_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    guild_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_recent_messages_user_guild_time 
ON recent_messages(user_id, guild_id, created_at);
