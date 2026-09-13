import {
  getSystemSettings,
  updateSystemSettings,
} from "../models/settings.model.js";

export const getSettingsController = async (req, res) => {
  try {
    const settings = await getSystemSettings();
    res.json(settings);
  } catch (error) {
    console.error("Error fetching system settings:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateSettingsController = async (req, res) => {
  try {
    const updated = await updateSystemSettings(req.body);
    res.json(updated);
  } catch (error) {
    console.error("Error updating system settings:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

