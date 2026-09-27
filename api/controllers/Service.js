const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// ห้ามมีค่าสำรอง: ถ้าไม่ได้ตั้ง TOKEN_SECRET (หรือสั้นเกินไป) ให้ server ไม่เริ่มทำงาน
const secret = process.env.TOKEN_SECRET;
if (!secret || secret.length < 32) {
  throw new Error(
    "TOKEN_SECRET is missing or too short (min 32 chars). Set it in api/.env",
  );
}

const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN || "1d";
const BCRYPT_ROUNDS = 10;

const getToken = (req) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.slice(7).trim();
};

const verifyToken = (req) => {
  const token = getToken(req);
  if (!token) return null;
  try {
    return jwt.verify(token, secret, { algorithms: ["HS256"] });
  } catch (e) {
    return null;
  }
};

const requireRole = (role) => (req, res, next) => {
  const payload = verifyToken(req);
  if (!payload) return res.status(401).send({ message: "authorize fail" });
  if (role && payload.role !== role) {
    return res.status(403).send({ message: "forbidden" });
  }
  req.auth = payload;
  next();
};

const isBcryptHash = (value) =>
  typeof value === "string" && /^\$2[aby]\$\d{2}\$/.test(value);

module.exports = {
  getToken,

  signToken: (id, role) =>
    jwt.sign({ id, role }, secret, {
      algorithm: "HS256",
      expiresIn: TOKEN_EXPIRES_IN,
    }),

  // login ได้ทั้ง member และ admin (ใช้กับ route ที่ไม่ผูก role)
  isLogin: requireRole(null),
  isMember: requireRole("member"),
  isAdmin: requireRole("admin"),

  // อ่านจาก token ที่ verify แล้วเท่านั้น (ต้องผ่าน isLogin/isMember/isAdmin ก่อน)
  getMemberId: (req) => (req.auth ? req.auth.id : null),
  getAdminId: (req) => (req.auth ? req.auth.id : null),

  hashPassword: (plain) => bcrypt.hash(String(plain), BCRYPT_ROUNDS),

  // รองรับรหัสเดิมที่เป็น plaintext: คืน { ok, needsRehash }
  checkPassword: async (plain, stored) => {
    if (typeof plain !== "string" || !plain || !stored) {
      return { ok: false, needsRehash: false };
    }
    if (isBcryptHash(stored)) {
      return { ok: await bcrypt.compare(plain, stored), needsRehash: false };
    }
    return { ok: plain === stored, needsRehash: true };
  },

  // เลือกเฉพาะฟิลด์ที่อนุญาต ป้องกัน mass assignment
  pick: (obj, keys) => {
    const out = {};
    for (const k of keys) {
      if (obj && obj[k] !== undefined) out[k] = obj[k];
    }
    return out;
  },

  // ส่ง error แบบไม่เปิดเผยรายละเอียดภายใน
  sendError: (res, e, status = 500) => {
    // ข้อมูลซ้ำกับ unique index (เช่น เบอร์โทร/ชื่อผู้ใช้ซ้ำ)
    if (e && e.name === "SequelizeUniqueConstraintError") {
      if (!res.headersSent) {
        res.status(409).send({ message: "ข้อมูลนี้มีอยู่ในระบบแล้ว" });
      }
      return;
    }
    console.error(e);
    if (!res.headersSent) {
      res.status(status).send({ message: "เกิดข้อผิดพลาดในระบบ" });
    }
  },

  toPositiveInt: (value) => {
    const n = Number(value);
    return Number.isInteger(n) && n > 0 ? n : null;
  },
};
