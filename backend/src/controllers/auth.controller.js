import bcrypt from "bcryptjs";
import db from "../../db/2,db.config.js";

export async function register(req, res, next) {
  try {
    const { firstName, lastName, username: rawUsername, email, password } = req.body;
    
    // Combine firstName and lastName if sent from frontend, or fallback to username
    const username = rawUsername || `${firstName || ''} ${lastName || ''}`.trim() || "User";

    // Check if user already exists
    const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    await db.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    next(error);
  }
}