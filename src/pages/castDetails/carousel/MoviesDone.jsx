import React from "react";

import Carousel from "../../../components/carousel/Carousel";
import useFetch from "../../../hooks/useFetch";
import { useParams } from 'react-router-dom'


const MoviesDone = () => {
    const { id } = useParams()
    const { data, loading } = useFetch(
        `/person/${id}/movie_credits?language=en-US`
    );
    console.log(data, "movies done")

    return (
        <Carousel
            title="Movies done"
            data={data?.cast}
            loading={loading}
            endpoint={"movie"}
        />
    );
};

export default MoviesDone;