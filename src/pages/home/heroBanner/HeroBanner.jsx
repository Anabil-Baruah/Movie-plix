import React, { useState, useEffect, useRef } from 'react'
import './heroBanner.scss'
import { useNavigate } from 'react-router-dom'
import useFetch from '../../../hooks/useFetch';
import { useSelector } from 'react-redux';
import { fetchDataFromApi } from '../../../utils/api';

import { Img, ContentWrapper } from '../../../components'

const HeroBanner = () => {
  const [background, setBackground] = useState("")
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [isSuggesting, setIsSuggesting] = useState(false)
  const debounceRef = useRef(null)
  const navigate = useNavigate()
  const { url } = useSelector(state => state.home)
  const { data, loading } = useFetch("/movie/upcoming")

  useEffect(() => {
    const bg = url?.backdrop + data?.results?.[Math.floor(Math.random() * 20)]?.backdrop_path
    setBackground(bg)
  }, [data])

  const handleSearch = (e) => {
    if (e.key === 'Enter' && query.length > 0) {
      navigate(`/search/${query}`)
    }
  }

  const fetchSuggestions = async (q) => {
    if (!q || q.trim().length < 2) {
      setSuggestions([])
      return
    }
    try {
      setIsSuggesting(true)
      const data = await fetchDataFromApi('/search/multi', {
        query: q.trim(),
        include_adult: false,
        page: 1
      })
      const items = (data?.results || [])
        .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
        .slice(0, 8)
        .map((r) => ({
          id: r.id,
          media_type: r.media_type,
          title: r.title || r.name,
          year: (r.release_date || r.first_air_date || '').slice(0, 4)
        }))
      setSuggestions(items)
    } catch (err) {
      setSuggestions([])
    } finally {
      setIsSuggesting(false)
    }
  }

  const onQueryChange = (e) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300)
  }

  return (
    <div className='heroBanner'>
      {!loading && <div className="backdrop-img">
        <Img src={background}/>
      </div>}

    <div className="opacity-layer"></div>
      <ContentWrapper>
      <div className="heroBannerContent">
          <span className="title" >Welcome</span>
          <span className="subTitle">
            Discover millions of movies and TV shows.
          </span>
          <div className="searchInput">
            <input
              type="text"
              placeholder='Search for a movie'
              value={query}
              onChange={onQueryChange}
              onKeyUp={ handleSearch }
            />
            <button onClick={() => { if (query.trim()) navigate(`/search/${query.trim()}`)}}>Search</button>
            {suggestions.length > 0 && (
              <div className="suggestionsDropdown">
                {suggestions.map((s) => (
                  <div
                    key={`${s.media_type}-${s.id}`}
                    className="suggestionItem"
                    onClick={() => {
                      navigate(`/${s.media_type}/${s.id}`)
                      setSuggestions([])
                      setQuery('')
                    }}
                  >
                    <span className="suggestionTitle">{s.title}</span>
                    {s.year && <span className="suggestionMeta">{s.media_type.toUpperCase()} · {s.year}</span>}
                  </div>
                ))}
                {isSuggesting && <div className="suggestionLoading">Searching...</div>}
              </div>
            )}
          </div>
        </div>
      </ContentWrapper>
    </div>
  )
}

export default HeroBanner