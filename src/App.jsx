import { useEffect, useState } from 'react'
import { fetchDataFromApi } from './utils/api'
import { useSelector, useDispatch } from 'react-redux'
import { getApiConfiguration, getGenres } from './store/homeSlice'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// importing the components 
import { Footer, Header } from './components'

// importing the pages 
import { Page_404, Explore, SearchResults, Home, Details, CastDetails } from './pages'

function App() {
  const dispatch = useDispatch()
  const { url } = useSelector(state => state.home)
  useEffect(() => {
    fetchApiConfig();
    genersCall();
  }, [])

  const fetchApiConfig = () => {
    fetchDataFromApi('/configuration')
      .then((res) => {
        // console.log(res)

        const url = {
          backdrop: res.images.secure_base_url + "original",
          poster: res.images.secure_base_url + "original",
          profile: res.images.secure_base_url + "original"
        };
        dispatch(getApiConfiguration(url))
      })
  }

  const genersCall = async () => {
    let promises = []
    let endPoints = ["tv", "movie"]
    let allGeners = {}

    endPoints.forEach((endPoint) => {
      promises.push(fetchDataFromApi(`/genre/${endPoint}/list`))
    })

    const data = await Promise.all(promises)
    console.log(data, "all genres")

    data.map(({ genres }) => {
      return genres.map((item) => (allGeners[item.id] = item))
    })

    console.log(allGeners, "all genres")

    dispatch(getGenres(allGeners))
  }
  return (
    <>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/:mediaType/:id' element={<Details />} />
          <Route path='/search/:query' element={<SearchResults />} />
          <Route path='/person/:id' element={<CastDetails />} />
          <Route path='/explore/:mediaType' element={<Explore />} />
          <Route path='*' element={<Page_404 />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </>
  )
}

export default App
