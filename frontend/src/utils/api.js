import axios from "axios";

const BASE_URL = "https://api.themoviedb.org/3";
const TMDB_TOKEN = import.meta.env.VITE_APP_TMDB_TOKEN;
const TMDB_API_KEY = import.meta.env.VITE_APP_TMDB_API_KEY;

export const fetchDataFromApi = async (url, params) => {
    try {
        const config = {
            headers: TMDB_TOKEN ? { Authorization: `bearer ${TMDB_TOKEN}` } : {},
            params: {
                ...(params || {}),
                ...(TMDB_API_KEY ? { api_key: TMDB_API_KEY } : {})
            }
        };
        const { data } = await axios.get(BASE_URL + url, config);
        return data;
    } catch (error) {
        console.log(error);
        return error;
    }
}