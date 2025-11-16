import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { ContentWrapper, Carousel } from '../../../components'
import { fetchDataFromApi } from '../../../utils/api'

const BecauseWatched = () => {
  const { user } = useSelector((state) => state.auth)
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!user?.viewingHistory || user.viewingHistory.length === 0) return
      setLoading(true)
      const recent = user.viewingHistory.slice(0, 3)

      const promises = recent.map(async (item) => {
        const path = item.mediaType === 'tv' ? `/tv/${item.id}/similar` : `/movie/${item.id}/similar`
        const data = await fetchDataFromApi(path)
        const results = (data?.results || []).slice(0, 20)
        return {
          title: `Because you watched ${item.title}`,
          endpoint: item.mediaType,
          results
        }
      })

      const res = await Promise.all(promises)
      setSections(res.filter(s => s.results.length > 0))
      setLoading(false)
    }
    load()
  }, [user?.viewingHistory])

  if (!user?.viewingHistory || user.viewingHistory.length === 0) return null

  return (
    <>
      {sections.map((s, idx) => (
        <div className='carouselSection' key={idx}>
          <ContentWrapper>
            <span className='carouselTitle'>{s.title}</span>
          </ContentWrapper>
          <Carousel data={s.results} loading={loading} endpoint={s.endpoint} />
        </div>
      ))}
    </>
  )
}

export default BecauseWatched