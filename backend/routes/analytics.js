const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/analytics/summary
router.get('/summary', async (req, res) => {
  try {
    const [total, statusCounts, sourceCounts, recentLeads, monthlyCounts] = await Promise.all([
      Lead.countDocuments(),
      Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Lead.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }]),
      Lead.find().sort('-createdAt').limit(5).select('name email status source createdAt'),
      Lead.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 }
      ])
    ]);

    const statusMap = {};
    statusCounts.forEach(s => { statusMap[s._id] = s.count; });

    const conversionRate = total > 0
      ? Math.round(((statusMap['converted'] || 0) / total) * 100)
      : 0;

    res.json({
      total,
      new: statusMap['new'] || 0,
      contacted: statusMap['contacted'] || 0,
      qualified: statusMap['qualified'] || 0,
      converted: statusMap['converted'] || 0,
      lost: statusMap['lost'] || 0,
      conversionRate,
      sourceCounts,
      recentLeads,
      monthlyCounts
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
