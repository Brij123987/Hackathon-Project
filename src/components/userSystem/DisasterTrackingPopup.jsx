import React, { useState, useEffect } from 'react';
import { useLocationContext } from './LocationContext';

const DisasterTrackingPopup = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    countryCode: '+1',
    mobileNumber: '',
    locationConsent: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countryCodes, setCountryCodes] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [useThirdPartyApi, setUseThirdPartyApi] = useState(false);
  const { getCurrentLocation, locationData } = useLocationContext();

  // Default comprehensive country codes list
  const defaultCountryCodes = [
    { code: '+1', country: 'United States', flag: '🇺🇸', iso: 'US' },
    { code: '+1', country: 'Canada', flag: '🇨🇦', iso: 'CA' },
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧', iso: 'GB' },
    { code: '+91', country: 'India', flag: '🇮🇳', iso: 'IN' },
    { code: '+86', country: 'China', flag: '🇨🇳', iso: 'CN' },
    { code: '+81', country: 'Japan', flag: '🇯🇵', iso: 'JP' },
    { code: '+49', country: 'Germany', flag: '🇩🇪', iso: 'DE' },
    { code: '+33', country: 'France', flag: '🇫🇷', iso: 'FR' },
    { code: '+39', country: 'Italy', flag: '🇮🇹', iso: 'IT' },
    { code: '+34', country: 'Spain', flag: '🇪🇸', iso: 'ES' },
    { code: '+61', country: 'Australia', flag: '🇦🇺', iso: 'AU' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷', iso: 'BR' },
    { code: '+7', country: 'Russia', flag: '🇷🇺', iso: 'RU' },
    { code: '+82', country: 'South Korea', flag: '🇰🇷', iso: 'KR' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬', iso: 'SG' },
    { code: '+971', country: 'UAE', flag: '🇦🇪', iso: 'AE' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', iso: 'SA' },
    { code: '+27', country: 'South Africa', flag: '🇿🇦', iso: 'ZA' },
    { code: '+52', country: 'Mexico', flag: '🇲🇽', iso: 'MX' },
    { code: '+54', country: 'Argentina', flag: '🇦🇷', iso: 'AR' },
    { code: '+62', country: 'Indonesia', flag: '🇮🇩', iso: 'ID' },
    { code: '+60', country: 'Malaysia', flag: '🇲🇾', iso: 'MY' },
    { code: '+66', country: 'Thailand', flag: '🇹🇭', iso: 'TH' },
    { code: '+84', country: 'Vietnam', flag: '🇻🇳', iso: 'VN' },
    { code: '+63', country: 'Philippines', flag: '🇵🇭', iso: 'PH' },
    { code: '+92', country: 'Pakistan', flag: '🇵🇰', iso: 'PK' },
    { code: '+880', country: 'Bangladesh', flag: '🇧🇩', iso: 'BD' },
    { code: '+94', country: 'Sri Lanka', flag: '🇱🇰', iso: 'LK' },
    { code: '+977', country: 'Nepal', flag: '🇳🇵', iso: 'NP' },
    { code: '+20', country: 'Egypt', flag: '🇪🇬', iso: 'EG' },
    { code: '+234', country: 'Nigeria', flag: '🇳🇬', iso: 'NG' },
    { code: '+254', country: 'Kenya', flag: '🇰🇪', iso: 'KE' },
    { code: '+233', country: 'Ghana', flag: '🇬🇭', iso: 'GH' },
    { code: '+212', country: 'Morocco', flag: '🇲🇦', iso: 'MA' },
    { code: '+213', country: 'Algeria', flag: '🇩🇿', iso: 'DZ' },
    { code: '+216', country: 'Tunisia', flag: '🇹🇳', iso: 'TN' },
    { code: '+90', country: 'Turkey', flag: '🇹🇷', iso: 'TR' },
    { code: '+98', country: 'Iran', flag: '🇮🇷', iso: 'IR' },
    { code: '+964', country: 'Iraq', flag: '🇮🇶', iso: 'IQ' },
    { code: '+962', country: 'Jordan', flag: '🇯🇴', iso: 'JO' },
    { code: '+961', country: 'Lebanon', flag: '🇱🇧', iso: 'LB' },
    { code: '+972', country: 'Israel', flag: '🇮🇱', iso: 'IL' },
    { code: '+46', country: 'Sweden', flag: '🇸🇪', iso: 'SE' },
    { code: '+47', country: 'Norway', flag: '🇳🇴', iso: 'NO' },
    { code: '+45', country: 'Denmark', flag: '🇩🇰', iso: 'DK' },
    { code: '+358', country: 'Finland', flag: '🇫🇮', iso: 'FI' },
    { code: '+31', country: 'Netherlands', flag: '🇳🇱', iso: 'NL' },
    { code: '+32', country: 'Belgium', flag: '🇧🇪', iso: 'BE' },
    { code: '+41', country: 'Switzerland', flag: '🇨🇭', iso: 'CH' },
    { code: '+43', country: 'Austria', flag: '🇦🇹', iso: 'AT' },
    { code: '+48', country: 'Poland', flag: '🇵🇱', iso: 'PL' },
    { code: '+420', country: 'Czech Republic', flag: '🇨🇿', iso: 'CZ' },
    { code: '+421', country: 'Slovakia', flag: '🇸🇰', iso: 'SK' },
    { code: '+36', country: 'Hungary', flag: '🇭🇺', iso: 'HU' },
    { code: '+40', country: 'Romania', flag: '🇷🇴', iso: 'RO' },
    { code: '+359', country: 'Bulgaria', flag: '🇧🇬', iso: 'BG' },
    { code: '+30', country: 'Greece', flag: '🇬🇷', iso: 'GR' },
    { code: '+351', country: 'Portugal', flag: '🇵🇹', iso: 'PT' },
    { code: '+353', country: 'Ireland', flag: '🇮🇪', iso: 'IE' },
    { code: '+354', country: 'Iceland', flag: '🇮🇸', iso: 'IS' },
    { code: '+64', country: 'New Zealand', flag: '🇳🇿', iso: 'NZ' },
    { code: '+56', country: 'Chile', flag: '🇨🇱', iso: 'CL' },
    { code: '+57', country: 'Colombia', flag: '🇨🇴', iso: 'CO' },
    { code: '+58', country: 'Venezuela', flag: '🇻🇪', iso: 'VE' },
    { code: '+51', country: 'Peru', flag: '🇵🇪', iso: 'PE' },
    { code: '+593', country: 'Ecuador', flag: '🇪🇨', iso: 'EC' },
    { code: '+595', country: 'Paraguay', flag: '🇵🇾', iso: 'PY' },
    { code: '+598', country: 'Uruguay', flag: '🇺🇾', iso: 'UY' },
    { code: '+591', country: 'Bolivia', flag: '🇧🇴', iso: 'BO' },
    { code: '+502', country: 'Guatemala', flag: '🇬🇹', iso: 'GT' },
    { code: '+503', country: 'El Salvador', flag: '🇸🇻', iso: 'SV' },
    { code: '+504', country: 'Honduras', flag: '🇭🇳', iso: 'HN' },
    { code: '+505', country: 'Nicaragua', flag: '🇳🇮', iso: 'NI' },
    { code: '+506', country: 'Costa Rica', flag: '🇨🇷', iso: 'CR' },
    { code: '+507', country: 'Panama', flag: '🇵🇦', iso: 'PA' },
    { code: '+1', country: 'Jamaica', flag: '🇯🇲', iso: 'JM' },
    { code: '+1', country: 'Trinidad and Tobago', flag: '🇹🇹', iso: 'TT' },
    { code: '+1', country: 'Barbados', flag: '🇧🇧', iso: 'BB' },
    { code: '+852', country: 'Hong Kong', flag: '🇭🇰', iso: 'HK' },
    { code: '+853', country: 'Macau', flag: '🇲🇴', iso: 'MO' },
    { code: '+886', country: 'Taiwan', flag: '🇹🇼', iso: 'TW' },
    { code: '+976', country: 'Mongolia', flag: '🇲🇳', iso: 'MN' },
    { code: '+855', country: 'Cambodia', flag: '🇰🇭', iso: 'KH' },
    { code: '+856', country: 'Laos', flag: '🇱🇦', iso: 'LA' },
    { code: '+95', country: 'Myanmar', flag: '🇲🇲', iso: 'MM' },
    { code: '+975', country: 'Bhutan', flag: '🇧🇹', iso: 'BT' },
    { code: '+960', country: 'Maldives', flag: '🇲🇻', iso: 'MV' },
    { code: '+968', country: 'Oman', flag: '🇴🇲', iso: 'OM' },
    { code: '+974', country: 'Qatar', flag: '🇶🇦', iso: 'QA' },
    { code: '+965', country: 'Kuwait', flag: '🇰🇼', iso: 'KW' },
    { code: '+973', country: 'Bahrain', flag: '🇧🇭', iso: 'BH' },
    { code: '+993', country: 'Turkmenistan', flag: '🇹🇲', iso: 'TM' },
    { code: '+992', country: 'Tajikistan', flag: '🇹🇯', iso: 'TJ' },
    { code: '+996', country: 'Kyrgyzstan', flag: '🇰🇬', iso: 'KG' },
    { code: '+998', country: 'Uzbekistan', flag: '🇺🇿', iso: 'UZ' },
    { code: '+994', country: 'Azerbaijan', flag: '🇦🇿', iso: 'AZ' },
    { code: '+995', country: 'Georgia', flag: '🇬🇪', iso: 'GE' },
    { code: '+374', country: 'Armenia', flag: '🇦🇲', iso: 'AM' },
    { code: '+375', country: 'Belarus', flag: '🇧🇾', iso: 'BY' },
    { code: '+380', country: 'Ukraine', flag: '🇺🇦', iso: 'UA' },
    { code: '+373', country: 'Moldova', flag: '🇲🇩', iso: 'MD' },
    { code: '+383', country: 'Kosovo', flag: '🇽🇰', iso: 'XK' },
    { code: '+381', country: 'Serbia', flag: '🇷🇸', iso: 'RS' },
    { code: '+382', country: 'Montenegro', flag: '🇲🇪', iso: 'ME' },
    { code: '+387', country: 'Bosnia and Herzegovina', flag: '🇧🇦', iso: 'BA' },
    { code: '+385', country: 'Croatia', flag: '🇭🇷', iso: 'HR' },
    { code: '+386', country: 'Slovenia', flag: '🇸🇮', iso: 'SI' },
    { code: '+389', country: 'North Macedonia', flag: '🇲🇰', iso: 'MK' },
    { code: '+355', country: 'Albania', flag: '🇦🇱', iso: 'AL' },
    { code: '+377', country: 'Monaco', flag: '🇲🇨', iso: 'MC' },
    { code: '+378', country: 'San Marino', flag: '🇸🇲', iso: 'SM' },
    { code: '+39', country: 'Vatican City', flag: '🇻🇦', iso: 'VA' },
    { code: '+376', country: 'Andorra', flag: '🇦🇩', iso: 'AD' },
    { code: '+423', country: 'Liechtenstein', flag: '🇱🇮', iso: 'LI' },
    { code: '+370', country: 'Lithuania', flag: '🇱🇹', iso: 'LT' },
    { code: '+371', country: 'Latvia', flag: '🇱🇻', iso: 'LV' },
    { code: '+372', country: 'Estonia', flag: '🇪🇪', iso: 'EE' }
  ];

  // Fetch country codes from third-party API
  const fetchCountryCodesFromAPI = async () => {
    setLoadingCountries(true);
    try {
      // Using REST Countries API - free and reliable
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,idd,flag,cca2');
      const countries = await response.json();
      
      const formattedCountries = countries
        .filter(country => country.idd && country.idd.root && country.idd.suffixes)
        .map(country => {
          // Handle countries with multiple suffixes (like US with multiple area codes)
          const root = country.idd.root;
          const suffixes = country.idd.suffixes;
          
          return suffixes.map(suffix => ({
            code: `${root}${suffix}`,
            country: country.name.common,
            flag: country.flag || '🏳️',
            iso: country.cca2
          }));
        })
        .flat()
        .sort((a, b) => a.country.localeCompare(b.country));

      setCountryCodes(formattedCountries);
      console.log(`✅ Loaded ${formattedCountries.length} country codes from API`);
    } catch (error) {
      console.error('Failed to fetch country codes from API:', error);
      // Fallback to default list
      setCountryCodes(defaultCountryCodes);
      setErrors(prev => ({
        ...prev,
        api: 'Failed to load latest country codes. Using default list.'
      }));
    } finally {
      setLoadingCountries(false);
    }
  };

  // Initialize country codes
  useEffect(() => {
    if (useThirdPartyApi) {
      fetchCountryCodesFromAPI();
    } else {
      setCountryCodes(defaultCountryCodes);
    }
  }, [useThirdPartyApi]);

  // Auto-detect user's country based on location
  useEffect(() => {
    if (locationData && countryCodes.length > 0) {
      // Try to match user's location with country codes
      const userCountry = countryCodes.find(country => 
        country.country.toLowerCase().includes(locationData.city?.toLowerCase()) ||
        country.iso === locationData.countryCode
      );
      
      if (userCountry) {
        setFormData(prev => ({
          ...prev,
          countryCode: userCountry.code
        }));
      }
    }
  }, [locationData, countryCodes]);

  // Prevent body scroll when popup is open
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll on mobile
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
      };
    }
  }, [isOpen]);

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

  const toggleApiSource = () => {
    setUseThirdPartyApi(!useThirdPartyApi);
    setErrors(prev => ({ ...prev, api: '' })); // Clear API error
  };

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('popup-open');
    } else {
      document.body.classList.remove('popup-open');
    }
  
    return () => document.body.classList.remove('popup-open');
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-2 py-6 sm:items-center sm:p-6 bg-black/20 backdrop-blur-sm">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={handleClose}
      />

      {/* Popup Container */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex-shrink-0">
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
              aria-label="Close popup"
            >
              ×
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Country Code Source Toggle */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  📡 Country Code Source
                </label>
                <button
                  type="button"
                  onClick={toggleApiSource}
                  disabled={loadingCountries}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    useThirdPartyApi 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  } disabled:opacity-50`}
                >
                  {loadingCountries ? '⏳' : useThirdPartyApi ? '🌐 API' : '📋 Default'}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                {useThirdPartyApi ? 'Live data from REST Countries API' : 'Built-in comprehensive list'}
              </p>
              {errors.api && (
                <p className="text-orange-600 text-xs mt-2">{errors.api}</p>
              )}
            </div>

            {/* Mobile Number Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                📱 Mobile Number for Emergency Alerts
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Country Code */}
                <div>
                  <label className="block text-xs text-gray-600 mb-2">Country Code</label>
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleInputChange}
                    disabled={loadingCountries}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm disabled:opacity-50"
                  >
                    {loadingCountries ? (
                      <option>Loading...</option>
                    ) : (
                      countryCodes.map((country, index) => (
                        <option key={`${country.code}-${country.iso}-${index}`} value={country.code}>
                          {country.flag} {country.code} {country.country}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs text-gray-600 mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    placeholder="Enter mobile number"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                      errors.mobileNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>

              {errors.mobileNumber && (
                <p className="text-red-600 text-sm mt-2">{errors.mobileNumber}</p>
              )}

              <p className="text-gray-500 text-xs mt-2">
                We'll send SMS alerts for earthquakes, cyclones, and other disasters in your area
              </p>

              {/* Country Count Display */}
              <p className="text-gray-400 text-xs mt-1">
                {countryCodes.length} countries available • 
                {useThirdPartyApi ? ' Live API data' : ' Built-in database'}
              </p>
            </div>

            {/* Location Consent */}
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
                <div>
                  <label htmlFor="locationConsent" className="text-sm font-medium text-gray-900 cursor-pointer">
                    📍 Allow location tracking for personalized alerts
                  </label>
                  <div className="text-xs text-gray-600 mt-2 space-y-1">
                    <p>• Get alerts specific to your current location</p>
                    <p>• Receive warnings when disasters approach your area</p>
                    <p>• Location data is used only for disaster monitoring</p>
                    <p>• You can disable this anytime in settings</p>
                  </div>

                  {locationData && (
                    <div className="mt-3 p-2 bg-green-100 border border-green-200 rounded text-xs">
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
                <li>• Country codes are sourced from {useThirdPartyApi ? 'REST Countries API' : 'our secure database'}</li>
              </ul>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}
          </form>
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 p-4 sm:p-6 border-t border-gray-100 bg-white">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-3 py-2 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || loadingCountries}
              className="flex-1 px-3 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Setting up...
                </>
              ) : (
                <>🚨 Start Tracking</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisasterTrackingPopup;