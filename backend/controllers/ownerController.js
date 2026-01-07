import Owner from "../models/owner.js";

// REGISTER
export const registerOwner = async (req, res) => {
  try {
    const { name, email, password, category } = req.body;

    const existing = await Owner.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Owner already exists" });
    }

    const owner = await Owner.create({
      name,
      email,
      password,
      category,
    });

    res.status(201).json({ message: "Registered successfully", owner });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGIN
export const loginOwner = async (req, res) => {
  try {
    const { email, password } = req.body;

    const owner = await Owner.findOne({ email, password });

    if (!owner) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ message: "Login success", owner });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
