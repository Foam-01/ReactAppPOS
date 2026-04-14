const config = {
  api_path: 'https://api.pos.skin',
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
