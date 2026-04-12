module.exports = {
  getToken: (req) => {
    if (req.headers.authorization) {
      // วิธีที่ 1: replace แล้ว trim ช่องว่างออก
      return req.headers.authorization.replace("Bearer", "").trim();

      // หรือวิธีที่ 2 (แนะนำ): ใช้ split เพื่อแยก Bearer กับ Token ออกจากกัน
      // return req.headers.authorization.split(' ')[1];
    }
    return null;
  },
  isLogin: (req, res, next) => {
    require("dotenv").config();
    const jwt = require("jsonwebtoken");

    if (req.headers.authorization != null) {
      const token = req.headers.authorization.replace("Bearer", "").trim();
      const secret = process.env.secret;

      try {
        const verify = jwt.verify(token, secret);
        if (verify != null) {
          // ต้องใส่ return เพื่อไม่ให้โค้ดบรรทัดล่างทำงานต่อ
          return next();
        }
      } catch (e) {
        // กรณี token ผิดพลาด หรือหมดอายุ
        res.statusCode = 401;
        return res.send("authorize fail");
      }
    }

    // กรณีไม่มี Header authorization ส่งมา
    res.statusCode = 401;
    return res.send("authorize fail");
  },
  getMemberId: (req) => {
    const jwt = require("jsonwebtoken");
    const token = req.headers.authorization.replace("Bearer", "").trim();
    const payLond = jwt.decode(token);
    return payLond.id;
  },
  getAdminId: (req) => {
    const jwt = require("jsonwebtoken");
    const token = req.headers.authorization.replace("Bearer", "").trim();
    const payLond = jwt.decode(token);
    return payLond.id;
  },
};


