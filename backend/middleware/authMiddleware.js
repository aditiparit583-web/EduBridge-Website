const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Login आवश्यक आहे.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "JWT_SECRET सेट केलेले नाही.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: "Account उपलब्ध नाही किंवा बंद आहे.",
      });
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token चुकीचा किंवा कालबाह्य झाला आहे.",
    });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "Admin") {
    return res.status(403).json({
      message: "ही सुविधा फक्त Admin साठी आहे.",
    });
  }

  next();
};

module.exports = {
  authMiddleware,
  adminOnly,
};