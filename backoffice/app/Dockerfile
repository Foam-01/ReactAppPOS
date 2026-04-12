# --- ร่างที่ 1: ขั้นตอนการ Build โค้ด (Builder Stage) ---
# เลือกระบบปฏิบัติการที่มี Node.js 
FROM node:18-alpine AS builder

WORKDIR /app

# ก๊อปปี้ package.json และติดตั้ง dependencies
COPY package*.json ./
RUN npm install

# ก๊อปปี้โค้ดหน้าเว็บทั้งหมดเข้าไป แล้วสั่ง Build โค้ด
COPY . .
RUN npm run build


# --- ร่างที่ 2: ขั้นตอนการรันเว็บ (Production Stage) ---
# เลือก Nginx ที่เบาและเสถียรมากสำหรับการเปิดหน้าเว็บ
FROM nginx:alpine

# ก๊อปปี้โฟลเดอร์ /build (ที่ได้จากร่างที่ 1) มาใส่ในโฟลเดอร์ของ Nginx
COPY --from=builder /app/build /usr/share/nginx/html

# เปิดประตูหมายเลข 80 (พอร์ตมาตรฐานสำหรับเว็บ)
EXPOSE 80

# สั่งให้ Nginx ทำงานเป็นเบื้องหน้า (ไม่ให้กล่องดับ)
CMD ["nginx", "-g", "daemon off;"]