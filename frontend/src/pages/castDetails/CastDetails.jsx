import React, { useState, useEffect } from 'react'

import './castDetails.scss'

import CastInfoBanner from './castInfoBanner/CastInfoBanner'
import MoviesDone from './carousel/MoviesDone'


const CastDetails = () => {
  return (
    <div>
      <CastInfoBanner/>
      <MoviesDone/>
    </div>
  )

}
export default CastDetails