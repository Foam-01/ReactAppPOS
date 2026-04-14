const config = {
  api_path: "https://api.pos.skin",
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
