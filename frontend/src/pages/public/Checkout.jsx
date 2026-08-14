import React, { useState } from 'react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useCartStore from '../../store/useCartStore';

// Helper to dynamically load the Razorpay script
const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const clearCart = useCartStore(state => state.clearCart);
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  
  const cartItems = useCartStore(state => state.items);
  const cartTotal = useCartStore(state => state.getCartTotal());
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priceMismatch, setPriceMismatch] = useState(null); // { original, new, orderResData }
  const [activePromotions, setActivePromotions] = useState([]);

  const COD_CAP = 5000;

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch user's saved addresses
      const addrRes = await api.get('/addresses');
      if (addrRes.data.data) {
        setAddresses(addrRes.data.data);
        if (addrRes.data.data.length > 0) {
          const defaultAddr = addrRes.data.data.find(a => a.isDefault) || addrRes.data.data[0];
          setSelectedAddressId(defaultAddr.id);
          checkPincode(defaultAddr.pincode);
        }
      }

      // Cart items are read directly from useCartStore now, no need to fetch from backend
      
      const promosRes = await api.get('/promotions/active');
      if (promosRes.data?.data) {
        setActivePromotions(promosRes.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to calculate local Buy X Get Y (similar to backend) for display
  const calculateBuyXGetY = () => {
    let discount = 0;
    const bxgPromos = activePromotions.filter(p => p.type === 'BUY_X_GET_Y');
    
    bxgPromos.forEach(promo => {
      let eligibleItems = [];
      cartItems.forEach(item => {
        const matchesScope = 
          promo.scope === 'ALL' ||
          (promo.scope === 'CATEGORY' && item.category?.id === promo.categoryId) ||
          (promo.scope === 'SPECIFIC_PRODUCTS' && promo.products?.some(p => p.id === item.id));
        
        if (matchesScope) {
          for (let i = 0; i < item.quantity; i++) {
            eligibleItems.push(item);
          }
        }
      });

      if (eligibleItems.length > 0) {
        eligibleItems.sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0));
        const totalRequired = promo.buyQty + promo.getQty;
        const bundleCount = Math.floor(eligibleItems.length / totalRequired);
        if (bundleCount > 0) {
          const freeItemsCount = bundleCount * promo.getQty;
          for (let i = 0; i < freeItemsCount; i++) {
            discount += (eligibleItems[i].basePrice || 0);
          }
        }
      }
    });
    return discount;
  };

  const buyXGetYDiscount = calculateBuyXGetY();
  const calculatedTotal = cartTotal - buyXGetYDiscount;

  const checkPincode = async (pin) => {
    if (pin.length === 6) {
      setCheckingPincode(true);
      try {
        const res = await api.get(`/delivery/check?pincode=${pin}`);
        setDeliveryInfo(res.data.data);
        if (!res.data.data.codAvailable && paymentMethod === 'COD') {
          setPaymentMethod('RAZORPAY');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingPincode(false);
      }
    }
  };

  const handleAddressChange = (id) => {
    setSelectedAddressId(id);
    const addr = addresses.find(a => a.id === id);
    if (addr) checkPincode(addr.pincode);
  };


  const handleCheckout = async (e) => {
    e.preventDefault();
    if (deliveryInfo && !deliveryInfo.serviceable) {
      alert('Pincode is not serviceable');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format items for backend
      const formattedItems = cartItems.map(item => {
        if (item.isBoxBuilder) {
          return {
            boxBuilderConfigId: item.boxBuilderConfigId,
            boxBuilderSelections: item.boxBuilderSelections,
            quantity: item.quantity,
            price: item.basePrice || 0
          };
        }
        return {
          productId: item.id,
          variantId: item.variantId || undefined,
          quantity: item.quantity,
          price: item.basePrice || item.salePrice || 0
        };
      });

      // 1. Create order on the backend
      const res = await api.post('/orders', {
        items: formattedItems,
        addressId: selectedAddressId,
        paymentMethod
      });
      
      const resData = res.data.data;
      // COD returns { order: {...} }, Razorpay returns { dbOrderId, razorpayOrderId, amount, key }
      const dbOrderId = resData?.dbOrderId || resData?.order?.id;
      const razorpayOrderId = resData?.razorpayOrderId;
      const amount = resData?.amount;
      const key = resData?.key;
      
      const serverTotal = paymentMethod === 'RAZORPAY' ? amount / 100 : resData?.order?.totalAmount;
      
      if (!priceMismatch && Math.abs(serverTotal - calculatedTotal) > 1) {
        setPriceMismatch({ original: calculatedTotal, new: serverTotal, orderResData: resData });
        setIsSubmitting(false);
        return;
      }

      processConfirmedOrder(resData, paymentMethod, dbOrderId, razorpayOrderId, amount, key);
    } catch (error) {
      console.error('Checkout failed:', error);
      setIsSubmitting(false);
      alert(error.response?.data?.message || 'Checkout failed. Please try again.');
    }
  };

  const processConfirmedOrder = async (resData, paymentMethod, dbOrderId, razorpayOrderId, amount, key) => {
    try {
      if (paymentMethod === 'COD') {
        // Go straight to confirmation
        clearCart();
        navigate(`/order-confirmation?method=cod&orderId=${dbOrderId}`);
      } else {
        // Razorpay flow
        const resScript = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
        if (!resScript) {
          alert('Razorpay SDK failed to load. Are you online?');
          setIsSubmitting(false);
          return;
        }

        const options = {
          key: key || import.meta.env.VITE_RAZORPAY_KEY_ID, // Use backend key or fallback
          amount: amount,
          currency: 'INR',
          name: 'Aurelia Jewels',
          description: 'Payment for your order',
          image: '/logo.png', // Add your logo
          order_id: razorpayOrderId,
          handler: async function (response) {
            try {
              // 3. Verify Payment
              const verifyRes = await api.post('/orders/verify-payment', {
                dbOrderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });

              if (verifyRes.data.success) {
                clearCart();
                navigate(`/order-confirmation?method=razorpay&orderId=${dbOrderId}`);
              }
            } catch (err) {
              alert(err.response?.data?.message || 'Payment verification failed');
            }
          },
          prefill: {
            name: user?.name || 'Customer',
            email: user?.email || '',
            contact: addresses.find(a => a.id === selectedAddressId)?.phone || ''
          },
          theme: {
            color: '#111111'
          }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', function (response) {
          alert('Payment Failed: ' + response.error.description);
        });
        paymentObject.open();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCodDisabled = deliveryInfo && !deliveryInfo.codAvailable;
  const isCodCapped = cartTotal > COD_CAP;

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <h1 style={{ marginBottom: 'var(--spacing-xl)' }}>Checkout</h1>

      <form onSubmit={handleCheckout} className="mobile-stack" style={{ display: 'flex', gap: 'var(--spacing-xl)', alignItems: 'flex-start' }}>
        
        {/* Left Column: Forms */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', width: '100%' }}>
          {/* Address Section */}
        <section className="glass-panel" style={{ padding: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
            <h3 style={{ margin: 0 }}>Select Shipping Address</h3>
            <button type="button" onClick={() => navigate('/profile')} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Manage Addresses</button>
          </div>
          
          {addresses.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', background: '#f9fafb', borderRadius: '8px' }}>
              <p>You have no saved addresses.</p>
              <button type="button" onClick={() => navigate('/profile')} className="btn btn-primary">Add an Address</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {addresses.map((addr) => (
                <label key={addr.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', border: selectedAddressId === addr.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', background: selectedAddressId === addr.id ? 'var(--color-primary-light)' : 'transparent' }}>
                  <input 
                    type="radio" 
                    name="address" 
                    checked={selectedAddressId === addr.id}
                    onChange={() => handleAddressChange(addr.id)}
                    style={{ marginTop: '4px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}>{addr.fullName} <span style={{ color: '#666', fontWeight: 400, marginLeft: '8px' }}>{addr.phone}</span></div>
                    <div style={{ fontSize: '0.9rem', color: '#555', marginTop: '4px' }}>
                      {addr.line1}, {addr.line2 && `${addr.line2}, `}{addr.city}, {addr.state} - {addr.pincode}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {checkingPincode && <small style={{ color: 'var(--color-text-muted)', display: 'block', marginTop: '12px' }}>Checking pincode serviceability...</small>}
          {deliveryInfo && selectedAddressId && (
            <div style={{ marginTop: '12px', padding: '12px', borderRadius: '4px', background: deliveryInfo.serviceable ? '#f0fdf4' : '#fef2f2', border: `1px solid ${deliveryInfo.serviceable ? '#bbf7d0' : '#fecaca'}` }}>
              <strong style={{ color: deliveryInfo.serviceable ? '#166534' : '#991b1b' }}>
                {deliveryInfo.serviceable ? `✓ Serviceable (${deliveryInfo.estimatedDays} days)` : '✕ Not serviceable in this area'}
              </strong>
            </div>
          )}
        </section>

        {/* Payment Section */}
        <section className="glass-panel" style={{ padding: 'var(--spacing-lg)' }}>
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Payment Method</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', padding: 'var(--spacing-md)', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="payment" 
                checked={paymentMethod === 'RAZORPAY'}
                onChange={() => setPaymentMethod('RAZORPAY')}
              />
              <div>
                <strong>Pay Online (Razorpay)</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>Credit/Debit Card, UPI, Netbanking</p>
              </div>
            </label>

            <label style={{ 
              display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', padding: 'var(--spacing-md)', 
              border: '1px solid var(--color-border)', borderRadius: '4px',
              opacity: (isCodDisabled || isCodCapped) ? 0.6 : 1,
              cursor: (isCodDisabled || isCodCapped) ? 'not-allowed' : 'pointer',
              background: (isCodDisabled || isCodCapped) ? '#f5f5f5' : 'transparent'
            }}>
              <input 
                type="radio" 
                name="payment" 
                disabled={isCodDisabled || isCodCapped}
                checked={paymentMethod === 'COD'}
                onChange={() => setPaymentMethod('COD')}
              />
              <div>
                <strong>Cash on Delivery (COD)</strong>
                {isCodDisabled && <p style={{ fontSize: '0.8rem', color: 'var(--color-error)', margin: 0 }}><AlertTriangle size={12} style={{display:'inline'}}/> COD not available for this pincode</p>}
                {isCodCapped && <p style={{ fontSize: '0.8rem', color: 'var(--color-warning)', margin: 0 }}><AlertTriangle size={12} style={{display:'inline'}}/> COD available for orders under ₹{COD_CAP}</p>}
                {!isCodDisabled && !isCodCapped && <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>Pay in cash when your order arrives</p>}
              </div>
            </label>
          </div>
        </section>
        </div>

        {/* Right Column: Order Summary & Submit */}
        <section className="glass-panel" style={{ flex: 1, padding: 'var(--spacing-lg)', position: 'sticky', top: '100px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
            
            {buyXGetYDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--color-success)' }}>
                <span>Buy X Get Y Discount</span>
                <span>-₹{buyXGetYDiscount.toFixed(2)}</span>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Shipping</span>
              <span>Free</span>
            </div>

            <hr style={{ margin: 'var(--spacing-md) 0', border: 'none', borderTop: '1px solid var(--color-border)' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: 'var(--spacing-lg)' }}>
              <span>Total</span>
              <span>₹{calculatedTotal.toFixed(2)}</span>
            </div>
            
            {priceMismatch && (
              <div style={{ background: '#fff3cd', border: '1px solid #ffeeba', color: '#856404', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} /> Price Updated
                </h4>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>
                  The items in your cart triggered promotional changes or stock adjustments during validation. Your new total is <strong>₹{priceMismatch.new.toFixed(2)}</strong> (was ₹{priceMismatch.original.toFixed(2)}).
                </p>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '10px' }}
                  onClick={() => {
                    const resData = priceMismatch.orderResData;
                    processConfirmedOrder(
                      resData, 
                      paymentMethod, 
                      resData?.dbOrderId || resData?.order?.id, 
                      resData?.razorpayOrderId, 
                      resData?.amount, 
                      resData?.key
                    );
                    setPriceMismatch(null);
                    setIsSubmitting(true);
                  }}
                >
                  Accept and Pay ₹{priceMismatch.new.toFixed(2)}
                </button>
                <button 
                  className="btn btn-outline" 
                  style={{ width: '100%', padding: '10px', marginTop: '10px' }}
                  onClick={() => setPriceMismatch(null)}
                >
                  Cancel
                </button>
              </div>
            )}

            {!priceMismatch && (
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}
                disabled={isSubmitting || checkingPincode || (deliveryInfo && !deliveryInfo.serviceable)}
              >
                {isSubmitting ? 'Processing...' : `Place Order • ₹${calculatedTotal.toFixed(2)}`}
              </button>
            )}
        </section>

      </form>
    </div>
  );
};

export default Checkout;
