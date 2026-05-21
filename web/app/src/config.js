const config = {
  // 🚀 เปลี่ยนตรงนี้เป็นลิงก์ Render ตัวใหม่ของคุณโฟม
  api_path: "https://foam-pos-api.onrender.com",
  token_name: "pos_token",
  headers: () => {
    return {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("pos_token"),
      },
    };
  },
};

export default config;
