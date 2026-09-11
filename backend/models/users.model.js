import pool from "../config/db.js";

export async function getAllUsers() {
  const result = await pool.query(
    "SELECT id, name, email, role, created_at FROM users ORDER BY id ASC"
  );
  return result.rows;
}

export async function getUserById(id) {
  const result = await pool.query(
    "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0] || null;
}

export async function findUserByEmail(email) {
  const result = await pool.query("SELECT * FROM users WHERE LOWER(email) = LOWER($1)", [
    email.trim(),
  ]);
  return result.rows[0] || null;
}

export async function createUser({ name, email, password_hash, role = "Employee" }) {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at`,
    [name.trim(), email.trim().toLowerCase(), password_hash, role]
  );
  return result.rows[0];
}

export async function updateUser(id, fields) {
  const allowed = ["name", "email", "password_hash", "role"];
  const sets = [];
  const values = [];
  let paramIdx = 1;

  for (const [key, val] of Object.entries(fields)) {
    if (allowed.includes(key) && val !== undefined && val !== null && val !== "") {
      sets.push(`${key} = $${paramIdx}`);
      values.push(key === "email" ? val.trim().toLowerCase() : val);
      paramIdx++;
    }
  }

  if (sets.length === 0) {
    return getUserById(id);
  }

  values.push(id);
  const query = `UPDATE users SET ${sets.join(", ")} WHERE id = $${paramIdx} RETURNING id, name, email, role, created_at`;
  const result = await pool.query(query, values);
  return result.rows[0] || null;
}

export async function deleteUser(id) {
  const result = await pool.query(`DELETE FROM users WHERE id = $1 RETURNING id, name, email`, [id]);
  return result.rows[0] || null;
}