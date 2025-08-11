import axios from "axios";

const api = axios.create({
  baseURL: "https://api.coingecko.com/api/v3/", // URL base della tua API
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "x-cg-demo-api-key": process.env.REACT_APP_CRYPTO_API_KEY // API Key da .env
  }
});

export default api;