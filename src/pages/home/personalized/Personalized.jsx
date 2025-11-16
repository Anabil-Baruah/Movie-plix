import React, { useState, useEffect } from 'react'
import { ContentWrapper, Carousel } from '../../../components'
import useFetch from '../../../hooks/useFetch'
import { useSelector } from 'react-redux'
import { fetchDataFromApi } from '../../../utils/api'

const Personalized = () => {
    const { user } = useSelector((state) => state.auth)
    const { genres } = useSelector((state) => state.home)
    const [recommendations, setRecommendations] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPersonalizedContent = async () => {
            if (!user?.preferences?.favoriteGenres || user.preferences.favoriteGenres.length === 0) {
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                const favoriteGenres = user.preferences.favoriteGenres
                
                // Fetch movies for each favorite genre
                const promises = favoriteGenres.slice(0, 3).map(async (genreId) => {
                    try {
                        // Fetch movies by genre
                        const movieData = await fetchDataFromApi('/discover/movie', {
                            with_genres: genreId,
                            sort_by: 'popularity.desc',
                            page: 1
                        })
                        
                        // Fetch TV shows by genre
                        const tvData = await fetchDataFromApi('/discover/tv', {
                            with_genres: genreId,
                            sort_by: 'popularity.desc',
                            page: 1
                        })

                        // Combine and limit results
                        const combined = [
                            ...(movieData?.results || []).slice(0, 5).map(item => ({ ...item, mediaType: 'movie' })),
                            ...(tvData?.results || []).slice(0, 5).map(item => ({ ...item, mediaType: 'tv' }))
                        ]

                        return {
                            genreId,
                            genreName: genres[genreId]?.name || 'Unknown',
                            results: combined.slice(0, 10)
                        }
                    } catch (error) {
                        console.error(`Error fetching genre ${genreId}:`, error)
                        return null
                    }
                })

                const results = await Promise.all(promises)
                const validResults = results.filter(r => r && r.results.length > 0)
                
                // Combine all results and shuffle for variety
                const allResults = validResults.flatMap(r => r.results)
                const shuffled = allResults.sort(() => Math.random() - 0.5)
                
                setRecommendations(shuffled.slice(0, 20))
            } catch (error) {
                console.error('Error fetching personalized content:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchPersonalizedContent()
    }, [user?.preferences?.favoriteGenres, genres])

    if (!user?.preferences?.favoriteGenres || user.preferences.favoriteGenres.length === 0) {
        return null
    }

    if (loading) {
        return (
            <div className='carouselSection'>
                <ContentWrapper>
                    <span className="carouselTitle">Recommended For You</span>
                </ContentWrapper>
                <Carousel data={[]} loading={true} />
            </div>
        )
    }

    if (recommendations.length === 0) {
        return null
    }

    return (
        <div className='carouselSection'>
            <ContentWrapper>
                <span className="carouselTitle">Recommended For You</span>
                <p className="carouselSubtitle">
                    Based on your favorite genres: {
                        user.preferences.favoriteGenres
                            .slice(0, 3)
                            .map(id => genres[id]?.name)
                            .filter(Boolean)
                            .join(', ')
                    }
                </p>
            </ContentWrapper>
            <Carousel data={recommendations} loading={loading} />
        </div>
    )
}

export default Personalized

