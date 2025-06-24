import React, { useState } from 'react';
import { useLocationContext } from './LocationContext';

const DisasterTrackingPopup = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    countryCode: '+1',
    mobileNumber: '',
    locationConsent: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getCurrentLocation, locationData } = useLocationContext();

  const countryCodes = [
    { code: '+1', country: 'US/Canada', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+39', country: 'Italy', flag: '🇮🇹' },
    { code: '+34', country: 'Spain', flag: '🇪🇸' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷' },
    { code: '+7', country: 'Russia', flag: '🇷🇺' },
    { code: '+82', country: 'South Korea', flag: '🇰🇷' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+27', country: 'South Africa', flag: '🇿🇦' },
    { code: '+52', country: 'Mexico', flag: '🇲🇽' },
    { code: '+54', country: 'Argentina', flag: '🇦🇷' },
    { code: '+62', country: 'Indonesia', flag: '🇮🇩' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate mobile number
    const mobileRegex = /^[0-9]{7,15}$/;
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!mobileRegex.test(formData.mobileNumber.replace(/\s+/g, ''))) {
      newErrors.mobileNumber = 'Please enter a valid mobile number (7-15 digits)';
    }

    // Validate location consent
    if (!formData.locationConsent) {
      newErrors.locationConsent = 'Location consent is required for disaster tracking';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current location if consent is given
      let location = locationData;
      if (formData.locationConsent && !location) {
        location = await getCurrentLocation();
      }

      const trackingData = {
        countryCode: formData.countryCode,
        mobileNumber: formData.mobileNumber.replace(/\s+/g, ''),
        locationConsent: formData.locationConsent,
        location: location
      };

      await onSubmit(trackingData);
      
      // Reset form
      setFormData({
        countryCode: '+1',
        mobileNumber: '',
        locationConsent: false
      });
      
    } catch (error) {
      console.error('Error setting up disaster tracking:', error);
      setErrors({ submit: 'Failed to set up disaster tracking. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        countryCode: '+1',
        mobileNumber: '',
        locationConsent: false
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                🚨 Setup Disaster Tracking
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Get real-time alerts for your location
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-white hover:text-gray-200 text-2xl font-bold disabled:opacity-50"
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Mobile Number Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              📱 Mobile Number for Emergency Alerts
            </label>
            
            <div className="flex gap-2">
              {/* Country Code Dropdown */}
              <select
                name="countryCode"
                value={formData.countryCode}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm min-w-[120px]"
              >
                {countryCodes.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.code}
                  </option>
                ))}
              </select>

              {/* Mobile Number Input */}
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                placeholder="Enter mobile number"
                className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.mobileNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            
            {errors.mobileNumber && (
              <p className="text-red-600 text-sm mt-1">{errors.mobileNumber}</p>
            )}
            
            <p className="text-gray-500 text-xs mt-2">
              We'll send SMS alerts for earthquakes, cyclones, and other disasters in your area
            </p>
          </div>

          {/* Location Consent Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="locationConsent"
                name="locationConsent"
                checked={formData.locationConsent}
                onChange={handleInputChange}
                className={`mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                  errors.locationConsent ? 'border-red-500' : ''
                }`}
              />
              <div className="flex-1">
                <label htmlFor="locationConsent" className="text-sm font-medium text-gray-900 cursor-pointer">
                  📍 Allow location tracking for personalized alerts
                </label>
                <div className="text-xs text-gray-600 mt-1 space-y-1">
                  <p>• Get alerts specific to your current location</p>
                  <p>• Receive warnings when disasters approach your area</p>
                  <p>• Location data is used only for disaster monitoring</p>
                  <p>• You can disable this anytime in settings</p>
                </div>
                
                {locationData && (
                  <div className="mt-2 p-2 bg-green-100 border border-green-200 rounded text-xs">
                    <span className="text-green-700 font-medium">
                      ✅ Current location: {locationData.city}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {errors.locationConsent && (
              <p className="text-red-600 text-sm mt-2">{errors.locationConsent}</p>
            )}
          </div>

          {/* Privacy Notice */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
              🔒 Privacy & Security
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Your mobile number is encrypted and stored securely</li>
              <li>• Location data is used only for disaster alert purposes</li>
              <li>• We never share your information with third parties</li>
              <li>• You can opt-out of tracking anytime</li>
            </ul>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Setting up...
                </>
              ) : (
                <>
                  🚨 Start Tracking
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DisasterTrackingPopup;