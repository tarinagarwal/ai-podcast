import { db } from "./database.js";
import bcrypt from "bcryptjs";

export class User {
  static async create(userData) {
    const { email, password, name } = userData;

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await db.runAsync(
      `INSERT INTO users (email, password, name) VALUES (?, ?, ?)`,
      [email, hashedPassword, name]
    );

    return this.findById(result.lastID);
  }

  static async findById(id) {
    return await db.getAsync(
      "SELECT id, email, name, created_at FROM users WHERE id = ?",
      [id]
    );
  }

  static async findByEmail(email) {
    return await db.getAsync("SELECT * FROM users WHERE email = ?", [email]);
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async update(id, updates) {
    const setClause = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(updates);

    await db.runAsync(`UPDATE users SET ${setClause} WHERE id = ?`, [
      ...values,
      id,
    ]);

    return this.findById(id);
  }

  static async delete(id) {
    await db.runAsync("DELETE FROM users WHERE id = ?", [id]);
    return true;
  }
}
