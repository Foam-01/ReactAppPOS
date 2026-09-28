require("dotenv").config();
// วันที่ในรายงาน (บิลวันนี้/รายวัน/รายเดือน) คิดตามเวลาไทย ไม่ใช่เวลาเครื่อง server (Render/Docker = UTC)
process.env.TZ = process.env.TZ || "Asia/Bangkok";
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");

require("./models/associations");
const app = express();

// อยู่หลัง proxy ของ Render/Docker: ให้ rate limit อ่าน IP จริงได้
app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(
  helmet({
    // รูปใน /uploads ถูกเรียกจากเว็บคนละ origin
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// จำกัด origin ที่เรียก API ได้ (คั่นด้วย , ใน CORS_ORIGINS)
const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  "http://localhost:3001,http://localhost:3002,http://localhost,http://localhost:8080"
)
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // ไม่มี origin = เรียกจาก server/curl ไม่ใช่เบราว์เซอร์
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
  }),
);

// บีบอัด response (gzip) ลดขนาด JSON ที่ส่งกลับ
app.use(compression());

app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(express.json({ limit: "100kb" }));

// กัน brute-force รหัสผ่าน และสมัครสมาชิกรัว ๆ
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "ลองเข้าสู่ระบบบ่อยเกินไป กรุณารอ 15 นาที" },
});
app.use(["/member/signin", "/admin/signin", "/package/memberRegister"], authLimiter);

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message: "มีการเรียกใช้งานมากเกินไป กรุณาลองใหม่ภายหลัง" },
  }),
);

// ไฟล์อัปโหลด: ห้ามเบราว์เซอร์เดาชนิดไฟล์ และห้ามรันสคริปต์
const uploadHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
  next();
};

// รูปย่อ WebP สำหรับการ์ดสินค้า (ต้องอยู่ก่อน static)
app.get("/uploads/thumb/:name", uploadHeaders, require("./controllers/thumbnail"));

app.use(
  "/uploads",
  uploadHeaders,
  // ชื่อไฟล์รูปมี timestamp ไม่ซ้ำกัน ไฟล์เดิมไม่ถูกแก้ จึง cache ได้นาน
  express.static("uploads", {
    dotfiles: "deny",
    index: false,
    maxAge: "30d",
    immutable: true,
  }),
);

[
  "PackageController",
  "MemberController",
  "ProductController",
  "ProductImageController",
  "UserController",
  "BillSaleController",
  "StockController",
  "BankController",
  "AdminController",
  "ChangePackageController",
].forEach((name) => {
  const controller = require("./controllers/" + name);
  app.use(controller);
});

// error ที่หลุดมา (เช่น JSON ผิดรูปแบบ): ไม่ส่งรายละเอียดภายในออกไป
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);
  res.status(status).send({
    message: status >= 500 ? "เกิดข้อผิดพลาดในระบบ" : "คำขอไม่ถูกต้อง",
  });
});

module.exports = app;
