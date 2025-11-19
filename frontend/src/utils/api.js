import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const fetchDataFromApi = async (url, params) => {
    try {
        const { data } = await axios.get(`${API_URL}/tmdb${url}`, {
            params
        });
        return data;
    } catch (error) {
        console.log(error);
        return error;
    }
}