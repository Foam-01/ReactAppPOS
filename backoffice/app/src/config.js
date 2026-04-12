const config = {
  api_path: "http://35.187.226.72:3000",
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
