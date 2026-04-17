const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, (req, res) => {
    // Dynamic mock logic, future ML integration point
    res.json({
        performanceData: [
            { name: 'Jan', revenue: 4000, expenses: 2400 },
            { name: 'Feb', revenue: 3000, expenses: 1398 },
            { name: 'Mar', revenue: 2000, expenses: 9800 },
            { name: 'Apr', revenue: 2850, expenses: 3908 },
            { name: 'May', revenue: 1890, expenses: 4800 },
            { name: 'Jun', revenue: 2390, expenses: 3800 },
            { name: 'Jul', revenue: 3490, expenses: 2900 },
        ],
        expenseData: [
            { name: 'Payroll', value: 4500 },
            { name: 'Marketing', value: 1200 },
            { name: 'Software', value: 800 },
            { name: 'Office', value: 500 },
        ],
        stats: [
            { title: "Total Revenue", value: "$45,231.89", trend: "+20.1%", iconType: "dollar", isPositive: true },
            { title: "Active Clients", value: "240", trend: "+12.5%", iconType: "user", isPositive: true },
            { title: "Active Projects", value: "45", trend: "-2.4%", iconType: "briefcase", isPositive: false },
        ]
    });
});

module.exports = router;
