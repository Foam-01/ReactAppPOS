const config = {
  // 🚀 เปลี่ยนตรงนี้เหมือนกันเพื่อให้ฝั่ง Admin คุยกับหลังบ้านตัวใหม่ได้
  api_path: "https://foam-pos-api.onrender.com",
  token_name: "admin_token",
  headers: () => {
    return {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("admin_token"),
      },
    };
  },
};

export default config;
