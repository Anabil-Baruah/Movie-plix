import express from 'express'
import User from '../models/User.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/collaborative', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean()
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const makeKey = (items = []) =>
      items.map((i) => `${i.mediaType}:${i.id}`)

    const baseKeys = Array.from(
      new Set([
        ...makeKey(user.favorites || []),
        ...makeKey(user.watchlist || []),
        ...makeKey((user.ratings || []).filter((r) => (r.rating || 0) >= 4)),
      ])
    )

    if (baseKeys.length === 0) {
      return res.json({ success: true, data: [] })
    }

    const pipeline = [
      { $match: { _id: { $ne: req.user._id } } },
      {
        $project: {
          favorites: 1,
          watchlist: 1,
          ratings: {
            $filter: {
              input: '$ratings',
              as: 'r',
              cond: { $gte: ['$$r.rating', 4] },
            },
          },
        },
      },
      {
        $addFields: {
          keys: {
            $setUnion: [
              {
                $map: {
                  input: { $ifNull: ['$favorites', []] },
                  as: 'f',
                  in: { $concat: ['$$f.mediaType', ':', { $toString: '$$f.id' }] },
                },
              },
              {
                $map: {
                  input: { $ifNull: ['$watchlist', []] },
                  as: 'w',
                  in: { $concat: ['$$w.mediaType', ':', { $toString: '$$w.id' }] },
                },
              },
              {
                $map: {
                  input: { $ifNull: ['$ratings', []] },
                  as: 'r',
                  in: { $concat: ['$$r.mediaType', ':', { $toString: '$$r.id' }] },
                },
              },
            ],
          },
        },
      },
      {
        $addFields: {
          overlap: { $size: { $setIntersection: ['$keys', baseKeys] } },
        },
      },
      { $match: { overlap: { $gte: 2 } } },
      {
        $project: {
          recommendKeys: { $setDifference: ['$keys', baseKeys] },
        },
      },
      { $unwind: '$recommendKeys' },
      { $group: { _id: '$recommendKeys', score: { $sum: 1 } } },
      { $sort: { score: -1 } },
      { $limit: 50 },
      {
        $project: {
          key: '$_id',
          score: 1,
          parts: { $split: ['$_id', ':'] },
        },
      },
      {
        $project: {
          id: { $toInt: { $arrayElemAt: ['$parts', 1] } },
          mediaType: { $arrayElemAt: ['$parts', 0] },
          score: 1,
        },
      },
    ]

    const recs = await User.aggregate(pipeline)
    res.json({ success: true, data: recs })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
})

export default router