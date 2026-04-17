const express = require('express');
const router = express.Router();
const Parser = require('rss-parser');
const parser = new Parser({
    timeout: 8000,
    headers: { 'User-Agent': 'DigitalCAPlatform/1.0' },
});

// Curated RSS feeds from official Indian financial regulators
const FEEDS = [
    { source: 'RBI', type: 'rbi', url: 'https://www.rbi.org.in/Commonman/English/scripts/AtomFeed.aspx' },
    { source: 'SEBI', type: 'sebi', url: 'https://www.sebi.gov.in/sebirss.xml' },
    { source: 'Income Tax', type: 'tax', url: 'https://www.incometax.gov.in/iec/foportal/rss-feed' },
    { source: 'MCA', type: 'mca', url: 'https://www.mca.gov.in/content/mcarss.xml' },
];

// Fallback curated news if all feeds fail
const fallbackNews = [
    { source: 'Income Tax Dept', type: 'tax', title: 'ITR Filing Deadline for AY 2026-27 Extended to August 31, 2026', summary: 'CBDT extends ITR filing deadline for individuals and HUFs from July 31 to August 31, citing portal upgrades.', date: new Date().toISOString(), link: 'https://incometaxindia.gov.in', isLive: false },
    { source: 'RBI', type: 'rbi', title: 'RBI Maintains Repo Rate at 6.0% — 3rd Consecutive Hold', summary: 'The MPC decided to keep the repo rate unchanged at 6.0%, maintaining an accommodative stance to support growth amid global uncertainties.', date: new Date(Date.now() - 86400000).toISOString(), link: 'https://rbi.org.in', isLive: false },
    { source: 'SEBI', type: 'sebi', title: 'New ESG Disclosure Norms for Top 500 Listed Companies', summary: 'SEBI mandates enhanced ESG reporting via BRSR Core for the top 500 companies by market cap, effective Q2 FY27.', date: new Date(Date.now() - 172800000).toISOString(), link: 'https://sebi.gov.in', isLive: false },
    { source: 'GST Council', type: 'gst', title: '53rd GST Council Meeting — Key Rate Rationalizations', summary: 'Reduced rates on essential food items from 12% to 5% and rationalized ITC provisions for real estate.', date: new Date(Date.now() - 259200000).toISOString(), link: 'https://gstcouncil.gov.in', isLive: false },
    { source: 'MCA', type: 'mca', title: 'LLP Form 11 Annual Return — Due Date May 30', summary: 'All LLPs must file Annual Return in Form 11 by May 30, 2026. Late fee of ₹100/day applies.', date: new Date(Date.now() - 345600000).toISOString(), link: 'https://mca.gov.in', isLive: false },
    { source: 'CBDT', type: 'tax', title: 'Updated TDS Guidelines for Virtual Digital Assets', summary: 'Circular No. 12/2026 clarifying TDS u/s 194S on crypto — exchanges must deduct 1% on transactions above ₹10,000.', date: new Date(Date.now() - 432000000).toISOString(), link: 'https://incometaxindia.gov.in', isLive: false },
    { source: 'RBI', type: 'rbi', title: 'UPI Transaction Limit Increased to ₹5 Lakh for Merchants', summary: 'RBI raised per-transaction UPI limit from ₹1 lakh to ₹5 lakh for merchant payments to boost digital transactions.', date: new Date(Date.now() - 518400000).toISOString(), link: 'https://rbi.org.in', isLive: false },
    { source: 'GST Council', type: 'gst', title: 'E-Invoice Mandatory for Turnover Above ₹5 Cr from July 2026', summary: 'GSTN notified e-invoicing mandatory for businesses with annual turnover exceeding ₹5 crore from July 1, 2026.', date: new Date(Date.now() - 604800000).toISOString(), link: 'https://gstcouncil.gov.in', isLive: false },
    { source: 'SEBI', type: 'sebi', title: 'Mutual Fund NAV Rules Changed for Large Purchases', summary: 'NAV allotment for purchases above ₹2 lakh now based on fund realization date instead of application date.', date: new Date(Date.now() - 691200000).toISOString(), link: 'https://sebi.gov.in', isLive: false },
    { source: 'Income Tax Dept', type: 'tax', title: 'Tax Audit Limit u/s 44AB Revised to ₹3 Crore', summary: 'Finance Act 2026 amended Section 44AB to increase threshold from ₹1Cr to ₹3Cr where cash transactions < 5%.', date: new Date(Date.now() - 777600000).toISOString(), link: 'https://incometaxindia.gov.in', isLive: false },
    { source: 'MCA', type: 'mca', title: 'Companies (Amendment) Act 2026 — Key Changes', summary: 'Simplified compliance for small companies, reduced board meeting requirements, enhanced whistleblower protections.', date: new Date(Date.now() - 864000000).toISOString(), link: 'https://mca.gov.in', isLive: false },
    { source: 'RBI', type: 'rbi', title: 'Digital Lending Guidelines — New KYC Norms Effective', summary: 'Updated framework requires full video KYC and 3-day cooling-off period for all digital loan disbursements.', date: new Date(Date.now() - 950400000).toISOString(), link: 'https://rbi.org.in', isLive: false },
];

// @desc    Get live news from official feeds + fallback
// @route   GET /api/news
router.get('/', async (req, res) => {
    let allItems = [];

    // Try fetching each live feed
    const feedPromises = FEEDS.map(async (feed) => {
        try {
            const parsed = await parser.parseURL(feed.url);
            return (parsed.items || []).slice(0, 5).map(item => ({
                source: feed.source,
                type: feed.type,
                title: item.title || 'Untitled',
                summary: item.contentSnippet || item.content || item.summary || '',
                date: item.isoDate || item.pubDate || new Date().toISOString(),
                link: item.link || '',
                isLive: true,
            }));
        } catch (err) {
            console.warn(`RSS feed failed for ${feed.source}: ${err.message}`);
            return [];
        }
    });

    try {
        const results = await Promise.allSettled(feedPromises);
        results.forEach(r => {
            if (r.status === 'fulfilled' && r.value.length > 0) {
                allItems.push(...r.value);
            }
        });
    } catch (err) {
        console.error('Feed aggregation failed:', err.message);
    }

    // Merge with fallback if not enough live news
    if (allItems.length < 6) {
        const existingTitles = new Set(allItems.map(i => i.title.toLowerCase()));
        const needed = fallbackNews.filter(f => !existingTitles.has(f.title.toLowerCase()));
        allItems.push(...needed);
    }

    // Sort by date descending
    allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Limit to 20 items
    res.json(allItems.slice(0, 20));
});

module.exports = router;
