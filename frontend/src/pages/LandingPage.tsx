import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, BarChart3, FileText, Calculator, Users, Zap, 
  ArrowRight, CheckCircle, Phone, Mail, MapPin, 
  TrendingUp, Clock, Globe, Star, ChevronRight,
  Landmark, Scale, Receipt, PieChart
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import './LandingPage.css';

// Animated Counter Component
function AnimatedCounter({ end, duration = 2, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const increment = end / (duration * 60);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 1000 / 60);
      return () => clearInterval(timer);
    }
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// Section wrapper with scroll animation
function ScrollSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

const services = [
  { icon: Shield, title: 'Tax Compliance', desc: 'Complete Income Tax, GST, and TDS filing with automated calculations and deadline tracking.' },
  { icon: BarChart3, title: 'Financial Reporting', desc: 'Real-time profit & loss, balance sheets, and cash flow statements with interactive visualizations.' },
  { icon: FileText, title: 'Audit & Assurance', desc: 'Statutory audits, internal audits, tax audits, and compliance reviews by seasoned professionals.' },
  { icon: Calculator, title: 'Smart Calculators', desc: 'Instantly compute taxes, GST, EMIs, TDS rates, and HRA exemptions with our digital tools.' },
  { icon: Users, title: 'Advisory Services', desc: 'Business incorporation, FEMA compliance, transfer pricing, and strategic financial consulting.' },
  { icon: Zap, title: 'Automation Suite', desc: 'Auto-categorize expenses, generate invoices, and receive intelligent alerts for deadlines.' },
];

const newsUpdates = [
  { source: 'Income Tax Dept', text: 'ITR filing deadline for AY 2026-27 extended to August 31, 2026', time: '2h ago', type: 'tax' },
  { source: 'RBI', text: 'RBI maintains repo rate at 6.0% — EMIs to remain stable', time: '5h ago', type: 'rbi' },
  { source: 'SEBI', text: 'New disclosure norms for listed companies effective from Q2 FY27', time: '8h ago', type: 'sebi' },
  { source: 'GST Council', text: '53rd GST Council Meeting: Key rate rationalizations announced', time: '1d ago', type: 'gst' },
  { source: 'MCA', text: 'Annual filing deadline for LLP Form 11 approaching — Due: May 30', time: '1d ago', type: 'mca' },
  { source: 'CBDT', text: 'Updated guidelines for TDS on cryptocurrency transactions released', time: '2d ago', type: 'tax' },
];

const testimonials = [
  { name: 'Rajesh Mehta', role: 'CEO, Mehta Industries', text: 'Digital CA transformed our entire financial workflow. The real-time dashboards save us hours every week.', rating: 5 },
  { name: 'Priya Sharma', role: 'Founder, UrbanCraft', text: 'Their automated tax calculations and compliance tracking are incredibly accurate. Highly recommended!', rating: 5 },
  { name: 'Amit Patel', role: 'CFO, TechVista Solutions', text: 'The task management and document system streamlined our audit prep. A game-changer for our finance team.', rating: 5 },
];

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav glass-panel">
        <div className="landing-container">
          <div className="nav-brand">
            <div className="brand-logo">CA</div>
            <span>Digital CA Platform</span>
          </div>
          <div className="nav-links">
            <a href="#services">Services</a>
            <a href="#about">About</a>
            <a href="#calculators">Calculators</a>
            <a href="#news">Updates</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="nav-actions">
            <ThemeToggle />
            <Link to="/login" className="btn-ghost">Sign In</Link>
            <Link to="/register" className="btn-cta">Get Started <ArrowRight size={16}/></Link>
          </div>
          <button className="mobile-menu-btn" id="mobile-menu-toggle">☰</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-image" />
        <div className="hero-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }} />
          ))}
        </div>
        <div className="landing-container hero-content">
          <motion.div 
            className="hero-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.span 
              className="hero-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              🚀 Next-Gen Financial Platform
            </motion.span>
            <h1>
              Smart Digital Platform for <br/>
              <span className="gradient-text">Chartered Accountants</span>
            </h1>
            <p>Digitize your CA practice with real-time dashboards, automated tax workflows, and seamless client communication — all in one intelligent platform.</p>
            <div className="hero-buttons">
              <Link to="/register" className="btn-cta btn-lg">
                Start Free Trial <ArrowRight size={20}/>
              </Link>
              <a href="#services" className="btn-ghost btn-lg">
                Explore Features <ChevronRight size={20}/>
              </a>
            </div>
          </motion.div>
          <motion.div 
            className="hero-visual"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="dashboard-preview glass-panel">
              <div className="preview-header">
                <div className="preview-dots"><span/><span/><span/></div>
                <span className="preview-title">Dashboard Preview</span>
              </div>
              <div className="preview-stats">
                <div className="preview-stat">
                  <TrendingUp size={16} />
                  <div><small>Revenue</small><strong>₹45.2L</strong></div>
                </div>
                <div className="preview-stat">
                  <Users size={16} />
                  <div><small>Clients</small><strong>240+</strong></div>
                </div>
                <div className="preview-stat">
                  <Clock size={16} />
                  <div><small>Deadlines</small><strong>12</strong></div>
                </div>
              </div>
              <div className="preview-chart">
                <svg viewBox="0 0 300 80" className="mini-chart">
                  <defs><linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3"/><stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0"/></linearGradient></defs>
                  <path d="M0,60 Q30,50 60,45 T120,30 T180,35 T240,20 T300,25 V80 H0Z" fill="url(#chartGrad)"/>
                  <path d="M0,60 Q30,50 60,45 T120,30 T180,35 T240,20 T300,25" fill="none" stroke="var(--color-primary)" strokeWidth="2"/>
                </svg>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="stats-section">
        <div className="landing-container stats-bar">
          <ScrollSection className="stat-item">
            <h3><AnimatedCounter end={500} suffix="+" /></h3>
            <p>Clients Served</p>
          </ScrollSection>
          <ScrollSection className="stat-item" delay={0.1}>
            <h3><AnimatedCounter end={15} suffix="+" /></h3>
            <p>Years Experience</p>
          </ScrollSection>
          <ScrollSection className="stat-item" delay={0.2}>
            <h3><AnimatedCounter end={10000} suffix="+" /></h3>
            <p>Returns Filed</p>
          </ScrollSection>
          <ScrollSection className="stat-item" delay={0.3}>
            <h3><AnimatedCounter end={99} suffix="%" /></h3>
            <p>Client Satisfaction</p>
          </ScrollSection>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section" id="services">
        <div className="landing-container">
          <ScrollSection className="section-header">
            <span className="section-tag">Our Services</span>
            <h2>Comprehensive CA Solutions</h2>
            <p>From tax filing to financial advisory — everything your business needs under one intelligent platform.</p>
          </ScrollSection>
          <div className="services-grid">
            {services.map((service, i) => (
              <ScrollSection key={service.title} className="service-card" delay={i * 0.1}>
                <div className="service-icon"><service.icon size={28} /></div>
                <h3>{service.title}</h3>
                <p>{service.desc}</p>
                <a href="#" className="service-link">Learn more <ArrowRight size={14}/></a>
              </ScrollSection>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section" id="about">
        <div className="landing-container about-grid">
          <ScrollSection className="about-image">
            <img src="/images/team.png" alt="Our expert team of Chartered Accountants" />
            <div className="about-image-badge glass-panel">
              <Globe size={20} />
              <span>Pan-India Presence</span>
            </div>
          </ScrollSection>
          <ScrollSection className="about-content" delay={0.2}>
            <span className="section-tag">About Us</span>
            <h2>Trusted by Businesses Across India</h2>
            <p>We are a team of experienced Chartered Accountants committed to transforming traditional accounting practices through technology. Our platform combines decades of financial expertise with cutting-edge automation.</p>
            <ul className="about-features">
              <li><CheckCircle size={18} /> ICAI Registered & Fully Compliant</li>
              <li><CheckCircle size={18} /> 15+ Years of Industry Experience</li>
              <li><CheckCircle size={18} /> Dedicated Relationship Managers</li>
              <li><CheckCircle size={18} /> Real-time Dashboard & Reporting</li>
              <li><CheckCircle size={18} /> ISO 27001 Certified Data Security</li>
            </ul>
            <Link to="/register" className="btn-cta" style={{marginTop: '1.5rem'}}>
              Join Our Platform <ArrowRight size={16}/>
            </Link>
          </ScrollSection>
        </div>
      </section>

      {/* Office Image Section */}
      <section className="office-section">
        <ScrollSection>
          <div className="landing-container">
            <div className="office-banner">
              <img src="/images/office.png" alt="Our modern workspace" />
              <div className="office-overlay">
                <h3>State-of-the-Art Infrastructure</h3>
                <p>Where technology meets tradition — our modern workspace powers next-gen financial services.</p>
              </div>
            </div>
          </div>
        </ScrollSection>
      </section>

      {/* Calculators Preview */}
      <section className="calculators-preview" id="calculators">
        <div className="landing-container">
          <ScrollSection className="section-header">
            <span className="section-tag">Digital Tools</span>
            <h2>Powerful Financial Calculators</h2>
            <p>Instantly estimate your taxes, EMIs, and exemptions with our intelligent calculator suite.</p>
          </ScrollSection>
          <div className="calc-grid">
            {[
              { icon: Receipt, name: 'Income Tax', desc: 'Old vs New Regime comparison' },
              { icon: Scale, name: 'GST Calculator', desc: 'CGST, SGST & IGST breakdown' },
              { icon: Landmark, name: 'EMI Calculator', desc: 'Loan amortization schedules' },
              { icon: PieChart, name: 'TDS Rates', desc: 'Section-wise TDS rate explorer' },
            ].map((calc, i) => (
              <ScrollSection key={calc.name} className="calc-card" delay={i * 0.1}>
                <calc.icon size={32} />
                <h4>{calc.name}</h4>
                <p>{calc.desc}</p>
                <Link to="/login" className="service-link">Use Calculator <ArrowRight size={14}/></Link>
              </ScrollSection>
            ))}
          </div>
        </div>
      </section>

      {/* Live News Section */}
      <section className="news-section" id="news">
        <div className="landing-container">
          <ScrollSection className="section-header">
            <span className="section-tag">Live Updates</span>
            <h2>Latest from RBI, SEBI & Tax Dept</h2>
            <p>Stay ahead with real-time regulatory updates and compliance alerts.</p>
          </ScrollSection>
          <div className="news-grid">
            {newsUpdates.map((news, i) => (
              <ScrollSection key={i} className="news-card" delay={i * 0.08}>
                <div className="news-source">
                  <span className={`source-badge ${news.type}`}>{news.source}</span>
                  <span className="news-time">{news.time}</span>
                </div>
                <p className="news-text">{news.text}</p>
              </ScrollSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="landing-container">
          <ScrollSection className="section-header">
            <span className="section-tag">Testimonials</span>
            <h2>What Our Clients Say</h2>
          </ScrollSection>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <ScrollSection key={i} className="testimonial-card" delay={i * 0.15}>
                <div className="stars">{[...Array(t.rating)].map((_, j) => <Star key={j} size={16} fill="var(--status-warning)" color="var(--status-warning)"/>)}</div>
                <p>"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{t.name[0]}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <small>{t.role}</small>
                  </div>
                </div>
              </ScrollSection>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section" id="contact">
        <div className="landing-container contact-grid">
          <ScrollSection className="contact-info">
            <span className="section-tag">Contact Us</span>
            <h2>Get in Touch</h2>
            <p>Have a question or want to schedule a consultation? We'd love to hear from you.</p>
            <div className="contact-details">
              <div className="contact-item"><Phone size={18}/><span>+91 20 2546 0114</span></div>
              <div className="contact-item"><Mail size={18}/><span>info@digitalca.com</span></div>
              <div className="contact-item"><MapPin size={18}/><span>Pune, Maharashtra, India</span></div>
            </div>
          </ScrollSection>
          <ScrollSection className="contact-form-card" delay={0.2}>
            <form className="landing-form" onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Your Name" required />
              <input type="email" placeholder="Email Address" required />
              <input type="text" placeholder="Subject" />
              <textarea placeholder="Your Message" rows={4} required />
              <button type="submit" className="btn-cta">Send Message <ArrowRight size={16}/></button>
            </form>
          </ScrollSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <ScrollSection className="landing-container cta-content">
          <h2>Ready to Digitize Your CA Practice?</h2>
          <p>Join 500+ businesses already using the Digital CA Platform for smarter financial management.</p>
          <Link to="/register" className="btn-cta btn-lg" style={{background: 'white', color: 'var(--color-primary)'}}>
            Get Started Free <ArrowRight size={20}/>
          </Link>
        </ScrollSection>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container footer-grid">
          <div className="footer-brand">
            <div className="brand-logo">CA</div>
            <h4>Digital CA Platform</h4>
            <p>Smart Digital Platform for Chartered Accountants with Real-Time Client Management and Financial Automation.</p>
          </div>
          <div className="footer-links">
            <h5>Services</h5>
            <a href="#">Tax Compliance</a>
            <a href="#">Audit & Assurance</a>
            <a href="#">Financial Advisory</a>
            <a href="#">Business Registration</a>
          </div>
          <div className="footer-links">
            <h5>Resources</h5>
            <a href="#">Tax Calculators</a>
            <a href="#">GST Rates</a>
            <a href="#">TDS Charts</a>
            <a href="#">Knowledge Bank</a>
          </div>
          <div className="footer-links">
            <h5>Company</h5>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
        <div className="landing-container footer-bottom">
          <p>© 2026 Digital CA Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
