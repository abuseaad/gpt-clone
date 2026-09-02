-- Create the conversations table if it doesn't already exist


CREATE TABLE IF NOT EXISTS conversations (
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
role ENUM('user', 'assistant') NOT NULL,
content TEXT NOT NULL CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
token_count INT UNSIGNED NOT NULL DEFAULT 0,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; 