const config = {
  api_path: "http://localhost:3000",
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
