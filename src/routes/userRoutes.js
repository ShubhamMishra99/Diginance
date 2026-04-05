const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const User = require('../models/userModel');
const router = express.Router();

router.get('/list', verifyToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    res.json(
      users.map((u) => ({
        id: u._id.toString(),
        username: u.username,
        role: u.role,
        createdAt: u.createdAt,
      })),
    );
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

//Only admin can access this routes
router.get("/admin", verifyToken, authorizeRoles("admin"), (req, res) => {
    res.status(200).json({ message: "Welcome Admin" });
});


//Both admin and manager can access this routes

router.get("/manager", verifyToken, authorizeRoles("admin", "manager"), (req, res) => {
    res.status(200).json({ message: "Welcome Manager" });
});

//All users can access this routes

router.get("/user", verifyToken, authorizeRoles("admin", "manager", "user"), (req, res) => {
    res.status(200).json({ message: "Welcome User" });
});

module.exports = router;