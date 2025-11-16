import React, { useState, useEffect } from 'react'
import './profile.scss'
import ContentWrapper from '../../components/contentWrapper/ContentWrapper'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { updateUser } from '../../store/authSlice'
import { 
  FiUser, 
  FiMail, 
  FiSettings, 
  FiHeart, 
  FiBookmark, 
  FiClock,
  FiSave,
  FiX,
  FiCheck
} from 'react-icons/fi'
import { updateUserProfile, getCurrentUser } from '../../services/authService'
import { Spinner } from '../../components'

const Profile = () => {
  const { user, isLoading: authLoading } = useSelector((state) => state.auth)
  const { genres } = useSelector((state) => state.home)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('preferences')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  
  const [preferences, setPreferences] = useState({
    language: 'en',
    autoplay: true,
    quality: 'auto'
  })

  const [selectedGenres, setSelectedGenres] = useState([])
  const [availableGenres, setAvailableGenres] = useState([])

  useEffect(() => {
    if (user) {
      setPreferences({
        language: user.preferences?.language || 'en',
        autoplay: user.preferences?.autoplay !== undefined ? user.preferences.autoplay : true,
        quality: user.preferences?.quality || 'auto'
      })
      setSelectedGenres(user.preferences?.favoriteGenres || [])
    }
  }, [user])

  useEffect(() => {
    // Convert genres object to array
    if (genres && Object.keys(genres).length > 0) {
      const genreArray = Object.values(genres).map(genre => ({
        id: genre.id,
        name: genre.name
      }))
      setAvailableGenres(genreArray)
    }
  }, [genres])

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const toggleGenre = (genreId) => {
    setSelectedGenres(prev => {
      if (prev.includes(genreId)) {
        return prev.filter(id => id !== genreId)
      } else {
        return [...prev, genreId]
      }
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage('')
    
    try {
      const updatedPreferences = {
        ...preferences,
        favoriteGenres: selectedGenres
      }

      const userId = user.id || user._id
      const updatedUser = await updateUserProfile(userId, {
        preferences: updatedPreferences
      })

      dispatch(updateUser(updatedUser))
      setSaveMessage('Preferences saved successfully!')
      
      setTimeout(() => {
        setSaveMessage('')
      }, 3000)
    } catch (error) {
      setSaveMessage('Failed to save preferences. Please try again.')
      console.error('Error updating preferences:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading) {
    return (
      <div className="profile-loading">
        <Spinner />
      </div>
    )
  }

  if (!user) {
    navigate('/authPage')
    return null
  }

  return (
    <div className="profile-page">
      <ContentWrapper>
        <div className="profile-container">
          {/* Header Section */}
          <div className="profile-header">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} />
                ) : (
                  <span>{user.username?.charAt(0).toUpperCase() || 'U'}</span>
                )}
              </div>
              <button className="change-avatar-btn">
                <FiUser /> Change Avatar
              </button>
            </div>
            <div className="profile-info">
              <h1 className="profile-name">{user.username}</h1>
              <p className="profile-email">
                <FiMail /> {user.email}
              </p>
              <p className="profile-joined">
                Member since {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long'
                })}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="profile-tabs">
            <button
              className={`tab ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              <FiSettings /> Preferences
            </button>
            <button
              className={`tab ${activeTab === 'genres' ? 'active' : ''}`}
              onClick={() => setActiveTab('genres')}
            >
              <FiHeart /> Favorite Genres
            </button>
            <button
              className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              <FiClock /> Activity
            </button>
          </div>

          {/* Tab Content */}
          <div className="profile-content">
            {saveMessage && (
              <div className={`save-message ${saveMessage.includes('success') ? 'success' : 'error'}`}>
                {saveMessage.includes('success') ? <FiCheck /> : <FiX />}
                {saveMessage}
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="tab-panel">
                <h2 className="panel-title">Account Preferences</h2>
                
                <div className="preferences-grid">
                  <div className="preference-item">
                    <label>
                      <span>Language</span>
                      <select
                        value={preferences.language}
                        onChange={(e) => handlePreferenceChange('language', e.target.value)}
                        className="preference-select"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="it">Italian</option>
                        <option value="pt">Portuguese</option>
                        <option value="ja">Japanese</option>
                        <option value="ko">Korean</option>
                        <option value="zh">Chinese</option>
                      </select>
                    </label>
                  </div>

                  <div className="preference-item">
                    <label>
                      <span>Video Quality</span>
                      <select
                        value={preferences.quality}
                        onChange={(e) => handlePreferenceChange('quality', e.target.value)}
                        className="preference-select"
                      >
                        <option value="auto">Auto</option>
                        <option value="1080p">1080p</option>
                        <option value="720p">720p</option>
                        <option value="480p">480p</option>
                        <option value="360p">360p</option>
                      </select>
                    </label>
                  </div>

                  <div className="preference-item checkbox-item">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={preferences.autoplay}
                        onChange={(e) => handlePreferenceChange('autoplay', e.target.checked)}
                        className="preference-checkbox"
                      />
                      <span>Enable Autoplay</span>
                      <p className="preference-description">
                        Automatically play next episode or recommended content
                      </p>
                    </label>
                  </div>
                </div>

                <button
                  className="save-button"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Spinner /> Saving...
                    </>
                  ) : (
                    <>
                      <FiSave /> Save Preferences
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Genres Tab */}
            {activeTab === 'genres' && (
              <div className="tab-panel">
                <h2 className="panel-title">Select Your Favorite Genres</h2>
                <p className="panel-description">
                  Choose your favorite genres to get personalized recommendations on your home page.
                  Select at least 3 genres for the best experience.
                </p>

                <div className="genres-grid">
                  {availableGenres.map((genre) => {
                    const isSelected = selectedGenres.includes(genre.id)
                    return (
                      <button
                        key={genre.id}
                        className={`genre-chip ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleGenre(genre.id)}
                      >
                        {isSelected && <FiCheck className="check-icon" />}
                        {genre.name}
                      </button>
                    )
                  })}
                </div>

                <div className="genres-info">
                  <p>
                    <strong>{selectedGenres.length}</strong> genre{selectedGenres.length !== 1 ? 's' : ''} selected
                  </p>
                  {selectedGenres.length < 3 && (
                    <p className="warning">
                      Select at least 3 genres for personalized recommendations
                    </p>
                  )}
                </div>

                <button
                  className="save-button"
                  onClick={handleSave}
                  disabled={isSaving || selectedGenres.length === 0}
                >
                  {isSaving ? (
                    <>
                      <Spinner /> Saving...
                    </>
                  ) : (
                    <>
                      <FiSave /> Save Genres
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="tab-panel">
                <h2 className="panel-title">Your Activity</h2>
                
                <div className="activity-stats">
                  <div className="stat-card">
                    <FiBookmark className="stat-icon" />
                    <div className="stat-info">
                      <h3>Watchlist</h3>
                      <p>{user.watchlist?.length || 0} items</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <FiHeart className="stat-icon" />
                    <div className="stat-info">
                      <h3>Favorites</h3>
                      <p>{user.favorites?.length || 0} items</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <FiClock className="stat-icon" />
                    <div className="stat-info">
                      <h3>Recently Watched</h3>
                      <p>{user.viewingHistory?.length || 0} items</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ContentWrapper>
    </div>
  )
}

export default Profile

