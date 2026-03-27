import jwt from "jsonwebtoken";
import Citizen from "../models/Citizen.js";
import { JWT_SECRET } from "../config/env.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    // Cookie first (preferred)
    if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }
    // Fallback to Bearer (optional)
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Not authorized to access this route" });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Attach user to request, exclude password
      req.user = await Citizen.findById(decoded.id).select("-password");

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Server error in auth middleware" });
  }
};
