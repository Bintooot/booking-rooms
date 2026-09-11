import { api } from "./client.js";

function getLocalUsers() {
  const saved = localStorage.getItem("confe_users");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return [];
    }
  }
  return [];
}

function saveLocalUsers(users) {
  localStorage.setItem("confe_users", JSON.stringify(users || []));
}

export async function getUsers() {
  try {
    const response = await api.get("/users");
    if (response.data && Array.isArray(response.data)) {
      saveLocalUsers(response.data);
      return response.data;
    }
  } catch (err) {
    console.warn("Backend /users unavailable, using local store:", err.message);
  }
  return getLocalUsers();
}

export async function createUser(data) {
  try {
    const response = await api.post("/users/register", data);
    if (response.data) {
      const current = getLocalUsers();
      saveLocalUsers([response.data, ...current]);
      return response.data;
    }
  } catch (err) {
    console.warn("Backend createUser failed, saving locally:", err.message);
  }

  const users = getLocalUsers();
  const newUser = {
    id: Date.now(),
    name: data.name || data.fullName,
    email: data.email,
    role: data.role || "Employee",
    department: data.department || "Engineering",
    created_at: new Date().toISOString(),
  };
  const updated = [newUser, ...users];
  saveLocalUsers(updated);
  return newUser;
}

export async function updateUser(id, data) {
  try {
    const response = await api.patch(`/users/${id}`, data);
    if (response.data) {
      const users = getLocalUsers().map((u) => (u.id === Number(id) ? { ...u, ...response.data } : u));
      saveLocalUsers(users);
      return response.data;
    }
  } catch (err) {
    console.warn(`Backend updateUser ${id} failed:`, err.message);
  }

  const users = getLocalUsers();
  let updatedUser = null;
  const updated = users.map((u) => {
    if (u.id === Number(id)) {
      updatedUser = { ...u, ...data };
      return updatedUser;
    }
    return u;
  });
  saveLocalUsers(updated);
  return updatedUser;
}

export async function deleteUser(id) {
  try {
    await api.delete(`/users/${id}`);
  } catch (err) {
    console.warn(`Backend deleteUser ${id} failed:`, err.message);
  }

  const users = getLocalUsers();
  const updated = users.filter((u) => u.id !== Number(id));
  saveLocalUsers(updated);
  return { success: true, id };
}
