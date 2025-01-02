-- Switch to the database
\c postgres;

-- Drop the table if it exists to ensure seed is repeatable
DROP TABLE IF EXISTS users;

-- Create the users table
CREATE TABLE users
(
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100)        NOT NULL,
    email      VARCHAR(100) UNIQUE NOT NULL,
    password   VARCHAR(255)        NOT NULL, -- You may store hashed passwords here
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data into the users table
INSERT INTO users (name, email, password)
VALUES ('John Doe', 'john.doe@example.com', 'hashed_password_1'),
       ('Jane Doe', 'jane.doe@example.com', 'hashed_password_2'),
       ('Alice Smith', 'alice.smith@example.com', 'hashed_password_3');