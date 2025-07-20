import { db } from "./database.js";

export class Podcast {
  static async create(podcastData) {
    const { user_id, title, description, knowledge_base, length } = podcastData;

    const result = await db.runAsync(
      `INSERT INTO podcasts (user_id, title, description, knowledge_base, length, status) 
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [user_id, title, description || "", knowledge_base, length]
    );

    return this.findById(result.lastID);
  }

  static async findById(id) {
    return await db.getAsync("SELECT * FROM podcasts WHERE id = ?", [id]);
  }

  static async findByUserId(userId, limit = 50, offset = 0) {
    return await db.allAsync(
      "SELECT * FROM podcasts WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [userId, limit, offset]
    );
  }

  static async findAll(limit = 50, offset = 0) {
    return await db.allAsync(
      "SELECT * FROM podcasts ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );
  }

  static async update(id, updates) {
    const setClause = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(updates);

    await db.runAsync(`UPDATE podcasts SET ${setClause} WHERE id = ?`, [
      ...values,
      id,
    ]);

    return this.findById(id);
  }

  static async updateStatus(id, status, errorMessage = null) {
    const updates = { status };
    if (errorMessage) {
      updates.error_message = errorMessage;
    }

    return this.update(id, updates);
  }

  static async belongsToUser(podcastId, userId) {
    const podcast = await db.getAsync(
      "SELECT id FROM podcasts WHERE id = ? AND user_id = ?",
      [podcastId, userId]
    );
    return !!podcast;
  }

  static async delete(id) {
    await db.runAsync("DELETE FROM podcasts WHERE id = ?", [id]);
    return true;
  }
}
