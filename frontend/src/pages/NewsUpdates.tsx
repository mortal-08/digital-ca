import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, ExternalLink, Bell, TrendingUp, Landmark, Scale, Receipt, Shield, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import './NewsUpdates.css';

type Source = 'all' | 'tax' | 'rbi' | 'sebi' | 'gst' | 'mca';

interface NewsItem {
  source: string;
  type: string;
  title: string;
  summary: string;
  date: string;
  link: string;
  isLive: boolean;
}

const sourceConfig: Record<string, { label: string; icon: any }> = {
  tax: { label: 'Income Tax', icon: Receipt },
  rbi: { label: 'RBI', icon: Landmark },
  sebi: { label: 'SEBI', icon: TrendingUp },
  gst: { label: 'GST Council', icon: Scale },
  mca: { label: 'MCA / ROC', icon: Shield },
};

export default function NewsUpdates() {
  const [activeSource, setActiveSource] = useState<Source>('all');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveCount, setLiveCount] = useState(0);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/news');
      if (res.ok) {
        const data = await res.json();
        setNews(data);
        setLiveCount(data.filter((n: NewsItem) => n.isLive).length);
      }
    } catch (err) {
      console.error('Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNews(); }, []);

  const filtered = activeSource === 'all' ? news : news.filter(n => n.type === activeSource);

  const timeSince = (dateStr: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="news-page">
      <header className="dashboard-header">
        <div>
          <h1><Newspaper size={28} /> Live Regulatory Updates</h1>
          <p className="text-muted">
            Real-time alerts from official RSS feeds — RBI, SEBI, Income Tax & more.
            {liveCount > 0 && (
              <span className="live-indicator"><Wifi size={14} /> {liveCount} live articles</span>
            )}
          </p>
        </div>
        <button className="btn-primary" onClick={fetchNews} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </header>

      {/* Urgent banner */}
      {news.length > 0 && (
        <motion.div className="alert-banner" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Bell size={18} />
          <strong>Latest:</strong> {news[0]?.title}
          {news[0]?.link && <a href={news[0].link} target="_blank" rel="noreferrer" className="alert-link">Read more →</a>}
        </motion.div>
      )}

      {/* Source Filters */}
      <div className="source-filters">
        <button className={`source-btn ${activeSource === 'all' ? 'active' : ''}`} onClick={() => setActiveSource('all')}>
          All Updates <span className="count">{news.length}</span>
        </button>
        {Object.entries(sourceConfig).map(([key, config]) => (
          <button key={key} className={`source-btn ${activeSource === key ? 'active' : ''}`} onClick={() => setActiveSource(key as Source)}>
            <config.icon size={16} /> {config.label}
            <span className="count">{news.filter(n => n.type === key).length}</span>
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="loading-spinner" style={{ margin: '0 auto' }} />
          <p className="text-muted" style={{ marginTop: '1rem' }}>Fetching live feeds from official sources...</p>
        </div>
      )}

      {/* News Feed */}
      {!loading && (
        <div className="news-feed">
          <AnimatePresence>
            {filtered.map((item, i) => {
              const config = sourceConfig[item.type] || { label: item.source, icon: Newspaper };
              return (
                <motion.article
                  key={`${item.title}-${i}`}
                  className="news-article card"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <div className="news-article-header">
                    <div className="news-source-info">
                      <span className={`source-chip ${item.type}`}>{config.label}</span>
                      {item.isLive && <span className="live-badge"><Wifi size={10} /> LIVE</span>}
                      {!item.isLive && <span className="cached-badge"><WifiOff size={10} /> Cached</span>}
                    </div>
                    <span className="news-date">{timeSince(item.date)}</span>
                  </div>
                  <h3>{item.title}</h3>
                  {item.summary && <p>{item.summary.substring(0, 250)}{item.summary.length > 250 ? '...' : ''}</p>}
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noreferrer" className="read-more">
                      Read on official site <ExternalLink size={14} />
                    </a>
                  )}
                </motion.article>
              );
            })}
          </AnimatePresence>
          {filtered.length === 0 && <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>No updates available for this source.</p>}
        </div>
      )}
    </div>
  );
}
