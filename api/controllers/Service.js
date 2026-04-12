const jwt = require("jsonwebtoken");
require("dotenv").config();

// ตั้งค่า Secret กลางไว้ที่นี่ที่เดียวเลยครับ จะได้ไม่ต้องพิมพ์ซ้ำหลายรอบ
const secret = process.env.TOKEN_SECRET || process.env.secret || "mykey";

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
