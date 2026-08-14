import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Gem, ShieldCheck, Leaf, Sparkles, Truck, RefreshCw } from 'lucide-react';
import styles from './AboutUs.module.css';

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      {/* 1. The Hero */}
      <section className={styles.aboutHero}>
        <motion.div 
          className={styles.heroContent}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className={styles.heroTitle}>More Than Jewelry. It's Your Daily Armor.</h1>
          <p className={styles.heroSubtitle}>Bridging the gap between everyday wear and luxury statement pieces.</p>
        </motion.div>
      </section>

      <div className="container">
        
        {/* Trust Signals Banner */}
        <div className={styles.trustBanner}>
          <div className={styles.trustItem}><ShieldCheck size={20} color="#16a34a" /> Secure Checkout</div>
          <div className={styles.trustItem}><RefreshCw size={20} color="#16a34a" /> 7-Day Easy Returns</div>
          <div className={styles.trustItem}><Truck size={20} color="#16a34a" /> Free Shipping Available</div>
        </div>

        {/* 2. Our Origin Story */}
        <section className={styles.storySection}>
          <motion.div 
            className={styles.storyImage}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <img 
              src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=1000&auto=format&fit=crop" 
              alt="Jewelry crafting process" 
            />
          </motion.div>
          <motion.div 
            className={styles.storyContent}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>The Spark</h2>
            <p>
              Aurelia Jewels was born from a simple realization: the modern woman shouldn't have to choose between waiting for a special occasion to wear beautiful jewelry and settling for fast-fashion pieces that tarnish after a week. We wanted to bridge that gap. We envisioned a brand that brought the feeling of luxury into everyday life.
            </p>
            
            <h3>Our Journey</h3>
            <p>
              What started as a small passion project in a tiny studio has blossomed into a community of fashion-forward individuals who know their worth. We spent months sourcing the right materials—hypoallergenic, durable, and radiant—to ensure that our pieces don't just look good in photographs, but stand the test of time on your skin.
            </p>

            <h3>The Aurelia Promise</h3>
            <p>
              For us, jewelry isn't just an accessory; it's a form of self-expression. It's the finishing touch that makes you feel put together, even on your busiest days. We design for the woman who is effortlessly chic, unapologetically ambitious, and deeply authentic. When you wear Aurelia, you wear confidence.
            </p>
          </motion.div>
        </section>
      </div>

      {/* 3. Core Values (Why Choose Us) */}
      <section className={styles.valuesSection}>
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>The Aurelia Standard</h2>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>Why our pieces deserve a spot in your jewelry box.</p>
          </div>
          
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <Gem size={40} className={styles.valueIcon} />
              <h3 className={styles.valueTitle}>Accessible Luxury</h3>
              <p className={styles.valueText}>
                We believe premium aesthetics shouldn't come with an intimidating price tag. By cutting out the middleman, we bring you high-end designs at honest prices.
              </p>
            </div>
            
            <div className={styles.valueCard}>
              <ShieldCheck size={40} className={styles.valueIcon} />
              <h3 className={styles.valueTitle}>Made for Everyday</h3>
              <p className={styles.valueText}>
                Our pieces are crafted using high-quality, skin-friendly metals that resist tarnishing. Go ahead—wear them from your morning coffee run to your evening out.
              </p>
            </div>
            
            <div className={styles.valueCard}>
              <Leaf size={40} className={styles.valueIcon} />
              <h3 className={styles.valueTitle}>Conscious Craftsmanship</h3>
              <p className={styles.valueText}>
                We are committed to ethical sourcing. Our packaging is 100% recyclable, and we partner with suppliers who prioritize fair labor and environmental responsibility.
              </p>
            </div>
            
            <div className={styles.valueCard}>
              <Sparkles size={40} className={styles.valueIcon} />
              <h3 className={styles.valueTitle}>Exclusive Designs</h3>
              <p className={styles.valueText}>
                You won't find mass-produced cookie-cutter styles here. Our collections are thoughtfully curated, blending timeless elegance with modern, bold trends.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* 4. Founder's Note */}
        <section className={styles.founderSection}>
          <img 
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop" 
            alt="Founder portrait" 
            className={styles.founderImage}
          />
          <p className={styles.founderText}>
            "I created Aurelia because I wanted pieces I could live in—jewelry that didn't need to be saved in a box for 'someday.' I wanted everyday armor that made me feel powerful, beautiful, and ready to take on the world. I hope our pieces make you feel the exact same way."
          </p>
          <div className={styles.founderSignature}>Aurelia</div>
        </section>

        {/* 5. Final CTA */}
        <section className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>Ready to find your everyday statement?</h2>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/collections')}
            style={{ padding: '16px 40px', fontSize: '1.1rem' }}
          >
            Shop Best Sellers
          </button>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;
