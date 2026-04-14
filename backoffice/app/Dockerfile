# Stage 1: Build (ใช้ Node สร้างไฟล์)
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve (ใช้ Nginx รันหน้าเว็บ)
FROM nginx:stable-alpine

# 1. ก๊อปปี้ไฟล์หน้าเว็บที่ Build เสร็จแล้วมาใส่
COPY --from=build-stage /app/build /usr/share/nginx/html

# 2. ก๊อปปี้ไฟล์ Config ของ Nginx ที่เราเพิ่งสร้าง (แก้ปัญหา F5 แล้ว 404)
# *** บรรทัดนี้ต้องอยู่ตรงนี้ครับ ***
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]