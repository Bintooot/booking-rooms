import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../models/users.model.js";

export const getUsersController = async (req, res) => {
  try {
    const users = await getAllUsers();

    if (users.length === 0) {
      return res.status(404).json({ error: "No users found." });
    }

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUserbyIdController = async (req, res) => {
  try {
    const userId = req.params.id;
    getUserById(userId).then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const registerUserController = async (req, res) => {
  try {
    const { name, email, password_hash, role } = req.body;

    if (!name || !email || !password_hash || !role) {
      return res
        .status(400)
        .json({ error: "name, email, password, and role are required" });
    }

    const user = await createUser({ name, email, password_hash, role });
    res.status(201).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateUserController = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, password_hash, role } = req.body;

    const updatedUser = await updateUser(userId, {
      name,
      email,
      password_hash,
      role,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const deleteUserController = async (req, res) => {
  try{
    const userId = req.params.id;
    const deletedUser = await deleteUser(userId);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ message: "User deleted successfully" });
  }catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
}