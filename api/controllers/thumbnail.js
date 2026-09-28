// รูปย่อสำหรับแสดงในการ์ดสินค้า: GET /uploads/thumb/<ชื่อไฟล์>
// รูปต้นฉบับ ~1–2MB (PNG 1024px) แต่แสดงแค่ ~240px → ย่อเป็น WebP ~20–40KB
// สร้างครั้งแรกแล้วเก็บไว้ที่ uploads/.thumbs (ชื่อไฟล์ต้นฉบับไม่ถูกแก้ จึง cache ได้ตลอด)
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
const THUMB_DIR = path.join(UPLOAD_DIR, ".thumbs");
const THUMB_WIDTH = 480; // การ์ดกว้าง ~240px × จอ 2x
const SAFE_NAME = /^[\w.-]+\.(png|jpe?g|webp|gif)$/i;

// กันสร้างไฟล์เดียวกันซ้ำเมื่อมีหลายคำขอพร้อมกัน
const pending = new Map();

const buildThumb = (src, dest) => {
  if (!pending.has(dest)) {
    const job = (async () => {
      await fs.promises.mkdir(THUMB_DIR, { recursive: true });
      const tmp = dest + "." + process.pid + ".tmp";
      await sharp(src)
        .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
        .webp({ quality: 72 })
        .toFile(tmp);
      await fs.promises.rename(tmp, dest);
    })().finally(() => pending.delete(dest));
    pending.set(dest, job);
  }
  return pending.get(dest);
};

module.exports = async (req, res) => {
  const name = req.params.name;
  if (!SAFE_NAME.test(name) || name.startsWith(".")) {
    return res.status(400).end();
  }
  const src = path.join(UPLOAD_DIR, name);
  const dest = path.join(THUMB_DIR, name + ".webp");

  try {
    if (!fs.existsSync(dest)) {
      if (!fs.existsSync(src)) return res.status(404).end();
      await buildThumb(src, dest);
    }
    res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
    res.type("image/webp");
    fs.createReadStream(dest).pipe(res);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) res.status(500).end();
  }
};
