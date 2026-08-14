import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Mail, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../utils/api';

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const method = searchParams.get('method');
  const orderId = searchParams.get('orderId');
  const isCod = method === 'cod';
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (orderId) {
      api.get(`/orders/${orderId}`)
        .then(res => setOrder(res.data.data?.order || res.data.data))
        .catch(() => {});
    }
  }, [orderId]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
  };

  const checkVariants = {
    hidden: { scale: 0, rotate: -180, opacity: 0 },
    visible: { scale: 1, rotate: 0, opacity: 1, transition: { type: 'spring', bounce: 0.6, duration: 1 } }
  };

  return (
    <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{ margin: 'var(--spacing-xxl) auto' }}
      >
        <motion.div variants={checkVariants} style={{ marginBottom: 'var(--spacing-md)' }}>
          <CheckCircle size={80} color="var(--color-success)" style={{ margin: '0 auto' }} />
        </motion.div>
        
        <motion.h1 variants={itemVariants} style={{ marginBottom: 'var(--spacing-sm)' }}>
          Order Placed Successfully!
        </motion.h1>
        
        <motion.p variants={itemVariants} style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', marginBottom: 'var(--spacing-xl)' }}>
          Thank you for shopping with Aurelia Jewels.{orderId && <> Your order number is <strong>#{orderId.slice(-8).toUpperCase()}</strong></>}
        </motion.p>

        {/* Notifications Banner */}
        <motion.div variants={itemVariants} style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', textAlign: 'left', marginBottom: 'var(--spacing-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', color: '#0369a1' }}>
            <Mail size={18} />
            <strong>Order Confirmation Sent</strong>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#0c4a6e', paddingLeft: '26px' }}>
            We've emailed your receipt and order details to your registered email address.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', color: '#0369a1', marginTop: 'var(--spacing-sm)' }}>
            <MessageSquare size={18} />
            <strong>SMS Updates Enabled</strong>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#0c4a6e', paddingLeft: '26px' }}>
            You will receive shipping updates on your phone number.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel" style={{ padding: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
          <h3>Payment Details</h3>
          <p style={{ fontSize: '1.1rem', margin: 'var(--spacing-md) 0' }}>
            {isCod ? (
              <>
                Please keep <strong>₹{order?.totalAmount?.toLocaleString('en-IN') || '—'}</strong> in cash ready when your order arrives.
              </>
            ) : (
              <>
                Payment of <strong>₹{order?.totalAmount?.toLocaleString('en-IN') || '—'}</strong> received via Razorpay.
              </>
            )}
          </p>
        </motion.div>

        <motion.div variants={itemVariants} style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
          <Link to="/shop" className="btn btn-outline">Continue Shopping</Link>
          <Link to="/orders" className="btn btn-primary">View My Orders</Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OrderConfirmation;
