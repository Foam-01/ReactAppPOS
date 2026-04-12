const config = {
  api_path: "http://localhost:3000",
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
