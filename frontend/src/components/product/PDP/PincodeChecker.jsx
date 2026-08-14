import React, { useState } from 'react';
import axios from 'axios';
import { MapPin, Truck } from 'lucide-react';
import styles from './PDP.module.css';

const PincodeChecker = () => {
  const [pincode, setPincode] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [checking, setChecking] = useState(false);

  const checkPincode = async () => {
    if (pincode.length !== 6) return;
    setChecking(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/delivery/check?pincode=${pincode}`);
      setDeliveryInfo(res.data.data);
    } catch (err) {
      console.error(err);
      setDeliveryInfo({ serviceable: false });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className={styles.pincodeContainer}>
      <h4 className={styles.pincodeTitle}>
        <MapPin size={16} /> Check Delivery Availability
      </h4>
      <div className={styles.pincodeInputGroup}>
        <input 
          type="text" 
          placeholder="Enter 6-digit Pincode" 
          maxLength="6"
          value={pincode}
          onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
          className={styles.pincodeInput}
        />
        <button 
          className={`btn btn-outline ${styles.pincodeBtn}`} 
          onClick={checkPincode}
          disabled={checking || pincode.length !== 6}
        >
          {checking ? '...' : 'Check'}
        </button>
      </div>

      {deliveryInfo && (
        <div className={styles.deliveryResult}>
          {deliveryInfo.serviceable ? (
            <div className={styles.serviceable}>
              <Truck size={16} color="#16a34a" />
              <span>
                Delivery available! 
                {deliveryInfo.estimatedDays && ` Expected in ${deliveryInfo.estimatedDays} days.`}
              </span>
            </div>
          ) : (
            <div className={styles.unserviceable}>
              Currently unserviceable in this area.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PincodeChecker;
