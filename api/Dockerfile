# 1. ใช้ Node.js เวอร์ชัน 18 เป็นฐาน
FROM node:18-alpine

# 2. ตั้งโฟลเดอร์ทำงานในคอนเทนเนอร์
WORKDIR /app

# 3. ก๊อปปี้ไฟล์ package.json เพื่อลง Library
COPY package*.json ./
RUN npm install

# 4. ก๊อปปี้โค้ดทั้งหมดตามเข้าไป
COPY . .

# 5. เปิดพอร์ต 3000
EXPOSE 3000

# 6. สั่งรันโปรเจกต์
CMD ["node", "server.js"]