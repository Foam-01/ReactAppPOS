const jwt = require("jsonwebtoken");
require("dotenv").config(); // 👈 โหลดเพื่อให้รู้จัก TOKEN_SECRET

// 🌟 ดึงค่า Secret จาก .env ถ้าไม่มีให้ใช้ "mykey" เป็นค่าสำรอง
const secret = process.env.TOKEN_SECRET || "mykey";

module.exports = {
  getToken: (req) => {
    if (req.headers.authorization) {
      return req.headers.authorization.replace("Bearer", "").trim();
    }
    return null;
  },

  isLogin: (req, res, next) => {
    const token = req.headers.authorization
      ? req.headers.authorization.replace("Bearer", "").trim()
      : null;

    if (token) {
      try {
        // 🌟 ใช้ secret ที่ดึงมาจาก .env
        const verify = jwt.verify(token, secret);
        if (verify) {
          return next();
        }
      } catch (e) {
        res.status(401).send("authorize fail: " + e.message);
        return;
      }
    }
    res.status(401).send("authorize fail");
  },

  getMemberId: (req) => {
    try {
      const token = req.headers.authorization.replace("Bearer", "").trim();
      const payload = jwt.decode(token);
      return payload ? payload.id : null;
    } catch (e) {
      return null;
    }
  },

  getAdminId: (req) => {
    try {
      const token = req.headers.authorization.replace("Bearer", "").trim();
      const payload = jwt.decode(token);
      return payload ? payload.id : null;
    } catch (e) {
      return null;
    }
  },
};
