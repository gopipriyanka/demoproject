import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import './Payment.css';
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;

const Payment = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({
    fullName: '',
    email: '',
    mobile: '',
  });
  const [formData, setFormData] = useState({
    address: '',
    area: '',
    townCity: '',
    state: '',
    pincode: '',
    cardNumber: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const userEmail = localStorage.getItem('userData')
      ? JSON.parse(localStorage.getItem('userData')).email
      : null;

    if (!userEmail) {
      alert('User session expired. Please log in again.');
      navigate('/signin');
      return;
    }

    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/user/${userEmail}`);
        setUserDetails(response.data.data);
      } catch (error) {
        console.error('Error fetching user details:', error);
        alert('Failed to fetch user details. Please try again later.');
        navigate('/signin');
      }
    };

    fetchUserDetails();
  }, [navigate]);

  const validateFields = () => {
    const newErrors = {};
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.area.trim()) newErrors.area = 'Area is required';
    if (!formData.townCity.trim()) newErrors.townCity = 'Town/City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Pincode must be a 6-digit number';
    if (!formData.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
    else if (!validateCardNumber(formData.cardNumber)) newErrors.cardNumber = 'Invalid card number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCardNumber = (number) => {
    let sum = 0;
    let shouldDouble = false;

    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    const paymentData = {
      name: userDetails.fullName,
      mobileNumber: userDetails.mobile,
      amount: 5,
    };

    try {
      const response = await axios.post(`${apiUrl}/api/payment/create-order`, paymentData);
      if (response.data && response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('Payment URL not returned');
      }
    } catch (error) {
      console.error('Error initiating payment:', error.message);
      alert('Error initiating payment. Please try again.');
    }
  };

  const handleBack = () => {
    navigate('/subscriptions');
  };

  return (
    <div className="App">
      <Header />
      <div className="payment-details-container">
        <Sidebar />
        <div className="content">
          <div className="form-container">
            <h1 className="form-title">Start Free Trial</h1>
            <form className="form" onSubmit={handlePayment}>
              <div className="form-group1">
                <label htmlFor="fullName">Full Name:</label>
                <input type="text" id="fullName" name="fullName" value={userDetails.fullName} readOnly />
              </div>
              <div className="form-group1">
                <label htmlFor="email">Email ID:</label>
                <input type="email" id="email" name="email" value={userDetails.email} readOnly />
              </div>
              <div className="form-group1">
                <label htmlFor="mobile">Phone Number:</label>
                <input type="text" id="mobile" name="mobile" value={userDetails.mobile} readOnly />
              </div>
              <div className="form-group1">
                <label htmlFor="address">Address:</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
                {errors.address && <div className="error-message">{errors.address}</div>}
              </div>
              <div className="form-group1">
                <label htmlFor="area">Area:</label>
                <input
                  type="text"
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                />
                {errors.area && <div className="error-message">{errors.area}</div>}
              </div>
              <div className="form-group1">
                <label htmlFor="townCity">Town/City:</label>
                <input
                  type="text"
                  id="townCity"
                  name="townCity"
                  value={formData.townCity}
                  onChange={handleInputChange}
                />
                {errors.townCity && <div className="error-message">{errors.townCity}</div>}
              </div>
              <div className="form-group1">
                <label htmlFor="state">State:</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                />
                {errors.state && <div className="error-message">{errors.state}</div>}
              </div>
              <div className="form-group1">
                <label htmlFor="pincode">Pincode:</label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                />
                {errors.pincode && <div className="error-message">{errors.pincode}</div>}
              </div>
              <div className="form-buttons">
                <button type="button" className="back" onClick={handleBack}>
                  Back
                </button>
                <button type="submit" className="next">
                  Next
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
