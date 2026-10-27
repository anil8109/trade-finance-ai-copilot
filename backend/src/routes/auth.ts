import { generateToken } from "../middleware/auth";
import { Router } from "express";

const router = Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Login data:', username, password);
  
  // In a real app, check DB. For assignment, we mock it:
  if (username === 'admin' && password === 'password') {
    const token = generateToken({ id: 1, role: 'Compliance_Officer' });
    return res.json({ token });
  }
  res.status(401).json({ error: "Invalid credentials" });
});

export default router;