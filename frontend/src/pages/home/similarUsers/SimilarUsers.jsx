import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { ContentWrapper, Carousel } from '../../../components'
import { fetchDataFromApi } from '../../../utils/api'
import { getCollaborativeRecommendations } from '../../../services/authService'

const SimilarUsers = () => {
  const { user } = useSelector((state) => state.auth)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!user) return
      setLoading(true)
      try {
        const recs = await getCollaborativeRecommendations()
        const top = recs.slice(0, 20)
        const fetches = top.map(async (r) => {
          const data = await fetchDataFromApi(`/${r.mediaType}/${r.id}`)
          return { ...data, mediaType: r.mediaType }
        })
        const hydrated = await Promise.all(fetches)
        setItems(hydrated.filter(Boolean))
      } catch (e) {
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  if (!user) return null
  if (items.length === 0 && !loading) return null

  return (
    <div className='carouselSection'>
      <ContentWrapper>
        <span className='carouselTitle'>From similar users</span>
      </ContentWrapper>
      <Carousel data={items} loading={loading} />
    </div>
  )
}

export default SimilarUsers