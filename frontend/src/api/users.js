import { api } from "../api/client";

export async function createUser(data) {
  const response = await api.post("/users/register", data);
  return response.data;
}

export async function getUsers() {
  const response = await api.get("/users");
  return response.data;
}
