const config = {
  api_path: 'http://35.187.226.72:3000',
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
