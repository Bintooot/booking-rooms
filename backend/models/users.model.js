import pool from "../config/db.js";

export async function getAllUsers() {
  const result = await pool.query(
    "SELECT id, name, email, role, created_at FROM users ORDER BY id ASC",
  );
  return result.rows;
}

export async function getUserById(id) {
  const result = await pool.query(
    "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
    [id],
  );
  return result.rows[0] || null;
}

export async function findUserByEmail(email) {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows[0] || null;
}

export async function createUser({ name, email, password_hash, role }) {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at`,
    [name, email, password_hash, role],
  );
  return result.rows[0];
}

export async function updateUser(id, { name, email, password_hash, role }) {
  const result = await pool.query(
    `UPDATE users SET
       name = COALESCE($1, name),
       email = COALESCE($2, email),
       password_hash = COALESCE($3, password_hash),
       role = COALESCE($4, role)
     WHERE id = $5
     RETURNING id, name, email, role, created_at`,
    [name, email, password_hash, role, id]
  );
  return result.rows[0] || null;
}

export async function deleteUser(id){
  const result = await pool.query(`DELETE FROM users WHERE id = $1 RETURNING id`, [id]);
  return result.rows[0] || null;
}