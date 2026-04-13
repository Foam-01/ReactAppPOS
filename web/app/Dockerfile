# Stage 1: ใช้ Node สร้างไฟล์ Build (แปลง React เป็น HTML/JS/CSS)
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: เอาไฟล์ที่ Build เสร็จแล้ว มาใส่ใน Nginx เพื่อเสิร์ฟขึ้นเว็บ
FROM nginx:stable-alpine
COPY --from=build-stage /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]