const TOKEN_NAME = "pos_token";

const config = {
  // ตั้ง REACT_APP_API_PATH ใน .env.development.local เพื่อให้เครื่องพัฒนาเรียก API local
  // (เช่น http://localhost:3000) ถ้าไม่ตั้งจะใช้ API บน Render ตามเดิม
  api_path: process.env.REACT_APP_API_PATH || "https://foam-pos-api.onrender.com",
  token_name: TOKEN_NAME,
  headers: () => {
    return {
      headers: {
        Authorization: "Bearer " + localStorage.getItem(TOKEN_NAME),
      },
    };
  },
};

export default config;
