import { api } from "./client.js";

export async function getUsers() {
  try {
    const response = await api.get("/users");
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
  } catch (err) {
    console.error("Failed to fetch users from backend:", err.message);
  }
  return [];
}

export async function createUser(data) {
  try {
    const response = await api.post("/users/register", data);
    return response.data;
  } catch (err) {
    console.error("Failed to create user on backend:", err.message);
    throw err;
  }
}

export async function updateUser(id, data) {
  try {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  } catch (err) {
    console.error(`Failed to update user ${id}:`, err.message);
    throw err;
  }
}

export async function deleteUser(id) {
  try {
    await api.delete(`/users/${id}`);
    return { success: true, id };
  } catch (err) {
    console.error(`Failed to delete user ${id}:`, err.message);
    throw err;
  }
}

export async function changePassword({ currentPassword, newPassword, targetUserId }) {
  try {
    const response = await api.post("/users/change-password", {
      currentPassword,
      newPassword,
      targetUserId,
    });
    return response.data;
  } catch (err) {
    const msg = err.response?.data?.error || err.message || "Failed to change password.";
    throw new Error(msg);
  }
}
