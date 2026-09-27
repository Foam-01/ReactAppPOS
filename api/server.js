// จุดเริ่ม server: ตัว express app อยู่ใน app.js (แยกไว้ให้เทสเรียกได้โดยไม่ต้อง listen)
const app = require("./app");
const ensureIndexes = require("./models/indexes");
const port = process.env.PORT || 3000;

app.listen(port, "0.0.0.0", () => {
  console.log("Server is running on port " + port);
  ensureIndexes();
});
