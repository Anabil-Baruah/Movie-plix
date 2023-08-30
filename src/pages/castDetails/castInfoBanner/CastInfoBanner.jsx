import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from "react-redux";
import InfiniteScroll from 'react-infinite-scroll-component'
import './castInfoBanner.scss'
import useFetch from "../../../hooks/useFetch";
import PosterFallback from "../../../assets/no-poster.png";
import Img from "../../../components/lazyLoadImg/Img.jsx";
import dayjs from 'dayjs';


import ContentWrapper from '../../../components/contentWrapper/ContentWrapper'
import Spinner from '../../../components/spinner/Spinner'

const CastInfoBanner = () => {
  const { id } = useParams()
  const { data, loading } = useFetch(`/person/${id}?language=en-US`);

  const { url } = useSelector((state) => state.home);


  return (
    <div className='castHeaderInfo'>
      {!loading ? (
        <>
          {data && (
            <ContentWrapper>
              <div className="left">
                {data.profile_path ? (
                  <Img
                    className="profileImg"
                    src={url.backdrop + data?.profile_path}
                  />
                ) : (
                  <Img
                    className="profileImg"
                    src={PosterFallback}
                  />

                )}
              </div>
              <div className="right">
                <div className="title">{data?.name || "N A"}</div>
                <div className="description">{data?.biography || "N A"}</div>
                <div className="info">
                  {data?.birthday && (
                    <div className="infoItem">
                      <span className="text bold">
                        Status:{" "}
                      </span>
                      <span className="text">
                        {dayjs(data?.birthday).format('MMMM DD, YYYY') || "N A"}
                      </span>
                    </div>
                  )}
                  {data?.birthday && (
                    <div className="infoItem">
                      <span className="text bold">
                        Place of birth:{" "}
                      </span>
                      <span className="text">
                        {data?.place_of_birth || "N A"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="info">
                  {data?.gender && (
                    <div className="infoItem">
                      <span className="text bold">
                        Gender:{" "}
                      </span>
                      <span className="text">
                        {data?.gender == 1 ?"Female":"Male" || "N A"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="info">
                  {data?.also_known_as && (
                    <div className="infoItem">
                      <span className="text bold">
                        Also known as:{" "}
                      </span>
                      <span className="text">
                        {data?.also_known_as[0] || "N A"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </ContentWrapper>
          )}
        </>
      ) : (
        <div className="castInfoBannerSkeleton">
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
  )
}

export default CastInfoBanner