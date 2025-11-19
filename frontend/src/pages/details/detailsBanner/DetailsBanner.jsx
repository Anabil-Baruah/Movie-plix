import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import dayjs from "dayjs";

import "./detailsBanner.scss";

import ContentWrapper from "../../../components/contentWrapper/ContentWrapper";
import useFetch from "../../../hooks/useFetch";
import Genres from "../../../components/genres/Genres";
import CircleRating from "../../../components/circleRating/CircleRating";
import Img from "../../../components/lazyLoadImg/Img.jsx";
import PosterFallback from "../../../assets/no-poster.png";
import { PlayButton } from '../playButton/PlayButton'
import VideoPopup from "../../../components/vidoePopup/VideoPopUp";
import { FiHeart, FiBookmark } from "react-icons/fi";
import { updateUser } from "../../../store/authSlice";
import { updateUserProfile } from "../../../services/authService";
import { message } from "antd";

const DetailsBanner = ({ video, crew }) => {
    const [show, setShow] = useState(false);
    const [videoId, setVideoId] = useState(null);

    const { mediaType, id } = useParams();
    const { data, loading } = useFetch(`/${mediaType}/${id}`);

    const { url } = useSelector((state) => state.home);

    const _genres = data?.genres.map((g) => g.id)

    const director = crew?.find((c) => c.job === "Director");
    const writer = crew?.find((c) => c.job === "Screenplay" || c.job === "Story" || c.job === "Writer");

    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const posterUrl = data?.poster_path ? url.poster + data.poster_path : PosterFallback;
    const isInWatchlist = user?.watchlist?.some((w) => w.id === data?.id && w.mediaType === mediaType);
    const isFavorite = user?.favorites?.some((f) => f.id === data?.id && f.mediaType === mediaType);
    const baseItem = { id: data?.id, mediaType: mediaType, title: data?.title || data?.name, poster: posterUrl };
    const handleToggleWatchlist = async () => {
        if (!user) return;
        const current = user.watchlist || [];
        const actionAdded = !isInWatchlist;
        const updated = isInWatchlist
            ? current.filter((w) => !(w.id === data.id && w.mediaType === mediaType))
            : [...current, { ...baseItem }];
        const updatedUser = await updateUserProfile(user.id || user._id, { watchlist: updated });
        dispatch(updateUser(updatedUser));
        message.success(actionAdded ? 'Added to Watchlist' : 'Removed from Watchlist');
    };
    const handleToggleFavorite = async () => {
        if (!user) return;
        const current = user.favorites || [];
        const actionAdded = !isFavorite;
        const updated = isFavorite
            ? current.filter((f) => !(f.id === data.id && f.mediaType === mediaType))
            : [...current, { ...baseItem }];
        const updatedUser = await updateUserProfile(user.id || user._id, { favorites: updated });
        dispatch(updateUser(updatedUser));
        message.success(actionAdded ? 'Added to Favorites' : 'Removed from Favorites');
    };

    const handlePlay = async () => {
        if (user && data?.id) {
            const current = user.viewingHistory || [];
            const filtered = current.filter((h) => !(h.id === data.id && h.mediaType === mediaType));
            const updated = [{ ...baseItem, watchedAt: new Date().toISOString() }, ...filtered].slice(0, 100);
            const updatedUser = await updateUserProfile(user.id || user._id, { viewingHistory: updated });
            dispatch(updateUser(updatedUser));
            message.success('Added to Recently Watched');
        }
        if (video?.key) {
            setVideoId(video.key);
            setShow(true);
        }
    };

    const toHoursAndMinutes = (totalMinutes) => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`;
    };

    return (
        <div className="detailsBanner">
            {!loading ? (
                <>
                    {data && (
                        <React.Fragment>
                            <div className="backdrop-img">
                                <Img src={url.backdrop + data.backdrop_path} />
                            </div>
                            <div className="opacity-layer"></div>
                            <ContentWrapper>
                                <div className="content">
                                    <div className="left">
                                        {data.poster_path ? (
                                            <Img
                                                className="posterImg"
                                                src={url.backdrop + data?.poster_path}
                                            />
                                        ) : (
                                            <Img
                                                className="posterImg"
                                                src={PosterFallback}
                                            />

                                        )}
                                    </div>
                                    <div className="right">
                                        <div className="title">
                                            {
                                                `${data.name ||
                                                data.title}
                                                (${dayjs(data?.release_date).format('YYYY')})`
                                            }
                                        </div>
                                        <div className="subtitle">
                                            {data.tagline}
                                        </div>
                                        <Genres data={_genres} />

                                        <div className="row">
                                            <CircleRating
                                                rating={data.vote_average.toFixed(1)}
                                            />
                                            <div className="playbtn" onClick={handlePlay}>
                                                <PlayButton />
                                                <span className="text">Watch trailer</span>
                                            </div>
                                        </div>
                                        <div className="detailActions">
                                            <button
                                                className={`actionBtn ${isInWatchlist ? 'active' : ''}`}
                                                onClick={handleToggleWatchlist}
                                            >
                                                <FiBookmark /> {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                                            </button>
                                            <button
                                                className={`actionBtn ${isFavorite ? 'active' : ''}`}
                                                onClick={handleToggleFavorite}
                                            >
                                                <FiHeart /> {isFavorite ? 'Favorited' : 'Add to Favorites'}
                                            </button>
                                        </div>

                                        <div className="overview">
                                            <div className="heading">
                                                <div className="heading">Overview</div>
                                                <div className="description">{data.overview}</div>
                                            </div>
                                        </div>
                                        <div className="info">
                                            {data.status && (
                                                <div className="infoItem">
                                                    <span className="text bold">
                                                        Status:{" "}
                                                    </span>
                                                    <span className="text">
                                                        {data.status}
                                                    </span>
                                                </div>
                                            )}
                                            {
                                                data.release_date && (
                                                    <div className="infoItem">
                                                        <span className="text bold">
                                                            Release date:{" "}
                                                        </span>
                                                        <span className="text">
                                                            {dayjs(data.release_date).format('MMMM DD, YYYY')}
                                                        </span>
                                                    </div>
                                                )
                                            }
                                            {
                                                data.runtime && (
                                                    <div className="infoItem">
                                                        <span className="text bold">
                                                            Runtime:{" "}
                                                        </span>
                                                        <span className="text">
                                                            {toHoursAndMinutes(data.runtime)}
                                                        </span>
                                                    </div>
                                                )
                                            }
                                        </div>
                                        {director !== undefined && director !== null  && (
                                            <div className="info">
                                                <span className="text bold">Director: </span>
                                                <span className="text">
                                                    {director?.name || "N A"}
                                                </span>
                                            </div>
                                        )}
                                        {writer !== null && writer !== undefined && (
                                            <div className="info">
                                                <span className="text bold">Writer: {" "}</span>
                                                <span className="text">
                                                    {writer?.name || "N A"}
                                                </span>
                                            </div>
                                        )}
                                        {data?.created_by?.length > 0 && (
                                            <div className="info">
                                                <span className="text bold">Creator: {" "}</span>
                                                <span className="text">
                                                    {data.created_by?.map((d, i) => (
                                                        <span key={i}>
                                                            {d.name}
                                                            {data.created_by?.length - 1 !== i && ", "}
                                                        </span>
                                                    ))}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <VideoPopup
                                    show={show}
                                    setShow={setShow}
                                    videoId={videoId}
                                    setVideoId={setVideoId} 
                                />
                            </ContentWrapper>
                        </React.Fragment>
                    )}
                </>
            ) : (
                <div className="detailsBannerSkeleton">
                    <ContentWrapper>
                        <div className="left skeleton"></div>
                        <div className="right">
                            <div className="row skeleton"></div>
                            <div className="row skeleton"></div>
                            <div className="row skeleton"></div>
                            <div className="row skeleton"></div>
                            <div className="row skeleton"></div>
                            <div className="row skeleton"></div>
                            <div className="row skeleton"></div>
                        </div>
                    </ContentWrapper>
                </div>
            )}
        </div>
    );
};

export default DetailsBanner;