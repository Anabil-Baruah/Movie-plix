import React from 'react'
import './subscriptions.scss'
import { ContentWrapper } from '../../components'
import { FiCheck, FiX } from 'react-icons/fi'

const Subscriptions = () => {
  const features = [
    { name: 'Browse movies', free: true, premium: true },
    { name: 'Recommendations', free: 'Limited', premium: 'Full AI model' },
    { name: 'Trailers', free: '480p', premium: '4K' },
    { name: 'Profile Avatars', free: false, premium: true },
    { name: 'Cast/Crew Insights', free: false, premium: true },
  ]

  return (
    <div className='subscriptionsPage'>
      <div className='hero'>
        <ContentWrapper>
          <h1 className='title'>Choose your plan</h1>
          <p className='subtitle'>Upgrade to unlock premium features and an impressive portfolio demo</p>
          <div className='plansGrid'>
            <div className='planCard free'>
              <div className='planHeader'>
                <h2>Free</h2>
                <div className='price'>$0<span>/mo</span></div>
              </div>
              <ul className='planFeatures'>
                {features.map((f) => (
                  <li key={`free-${f.name}`} className='featureRow'>
                    <span className='featureName'>{f.name}</span>
                    <span className='featureValue'>
                      {f.free === true && <FiCheck className='ok' />}
                      {f.free === false && <FiX className='no' />}
                      {typeof f.free === 'string' && f.free}
                    </span>
                  </li>
                ))}
              </ul>
              <button className='cta secondary'>Continue Free</button>
            </div>

            <div className='planCard premium'>
              <div className='planHeader'>
                <h2>Premium</h2>
                <div className='price'>$9.99<span>/mo</span></div>
              </div>
              <ul className='planFeatures'>
                {features.map((f) => (
                  <li key={`premium-${f.name}`} className='featureRow'>
                    <span className='featureName'>{f.name}</span>
                    <span className='featureValue'>
                      {f.premium === true && <FiCheck className='ok' />}
                      {f.premium === false && <FiX className='no' />}
                      {typeof f.premium === 'string' && f.premium}
                    </span>
                  </li>
                ))}
              </ul>
              <button className='cta primary' data-test='stripe-demo'>Continue to Payment</button>
              <div className='note'>Stripe Test Mode demo</div>
            </div>
          </div>
        </ContentWrapper>
      </div>
    </div>
  )
}

export default Subscriptions