import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath =
  process.env.DB_PATH || path.join(__dirname, "../database.sqlite");

// Create database connection
const db = new sqlite3.Database(dbPath);

// Promisify database methods manually
db.getAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

db.allAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

db.runAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

export const initializeDatabase = async () => {
  try {
    // First, check if we need to migrate existing data
    const tableInfo = await db.allAsync("PRAGMA table_info(podcasts)");
    const hasUserIdColumn = tableInfo.some(
      (column) => column.name === "user_id"
    );

    if (!hasUserIdColumn) {
      console.log("🔄 Migrating existing database schema...");

      // Add user_id column to existing podcasts table
      await db.runAsync(`
        ALTER TABLE podcasts ADD COLUMN user_id INTEGER
      `);

      console.log("✅ Added user_id column to podcasts table");
    }

    // Create users table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.runAsync(`
      CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
      AFTER UPDATE ON users 
      BEGIN 
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `);

    // Create podcasts table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS podcasts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        knowledge_base TEXT NOT NULL,
        length TEXT NOT NULL CHECK (length IN ('Short', 'Medium', 'Long')),
        script TEXT,
        audio_path TEXT,
        video_path TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    await db.runAsync(`
      CREATE TRIGGER IF NOT EXISTS update_podcasts_timestamp 
      AFTER UPDATE ON podcasts 
      BEGIN 
        UPDATE podcasts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `);

    // Assign existing podcasts to tarinagarwal@gmail.com if needed
    const existingPodcasts = await db.allAsync(
      "SELECT id FROM podcasts WHERE user_id IS NULL"
    );

    if (existingPodcasts.length > 0) {
      console.log(
        `🔄 Found ${existingPodcasts.length} podcasts without user_id, assigning to tarinagarwal@gmail.com...`
      );

      // Find the user with email tarinagarwal@gmail.com
      const targetUser = await db.getAsync(`
        SELECT id FROM users WHERE email = 'tarinagarwal@gmail.com'
      `);

      if (targetUser) {
        // Update existing podcasts to belong to tarinagarwal@gmail.com
        await db.runAsync(
          `
          UPDATE podcasts SET user_id = ? WHERE user_id IS NULL
        `,
          [targetUser.id]
        );

        console.log(
          `✅ Assigned ${existingPodcasts.length} existing podcasts to tarinagarwal@gmail.com`
        );
      } else {
        console.log(
          `❌ User tarinagarwal@gmail.com not found. Please register this user first.`
        );
        console.log(
          `📝 Existing podcasts will remain unassigned until the user is created.`
        );
      }
    }

    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
};

export { db };
