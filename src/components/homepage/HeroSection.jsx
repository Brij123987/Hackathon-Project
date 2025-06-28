import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useLocationContext } from "../userSystem/LocationContext";
import { useNavigate } from "react-router-dom";

function HeroSection () {

  const { locationData, isLoading, getCurrentLocation } = useLocationContext();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [cycloneImg, setCycloneImage] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
      const syncAuth = () => {
          const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
          setIsAuthenticated(!!token);
      };

      // Listen to authChange and storage events
      window.addEventListener('authChange', syncAuth);
      window.addEventListener('storage', syncAuth); // for cross-tab logout

      // Initial check
      syncAuth();

      return () => {
          window.removeEventListener('authChange', syncAuth);
          window.removeEventListener('storage', syncAuth);
      };
  }, []);

  useEffect(() => {
      if (!isAuthenticated) {
          // Reset the cyclone image
          setCycloneImage(null);
      }
  }, [isAuthenticated]);

  const fetchCycloneImage = useCallback( async () => {
    if (!locationData?.city || !isAuthenticated) return;

    try {
      const res = await axios.get(
        `${API_BASE_URL}/feature/get_cyclone_data/?location=${locationData.city}&end_date=${today}`,
        { timeout: 100000 }
      )

      const cycloneImg =  res.data.data.image_url;

      setCycloneImage(cycloneImg);

    } catch (err) {
      console.log("Failed to fetch cyclone image:", err);

    }
}, [locationData?.city, today, API_BASE_URL, isAuthenticated])

  useEffect(() => {
    fetchCycloneImage();
  }, [fetchCycloneImage]);

  const handleGetStarted = async () => {
    if (!isAuthenticated) {
      // If not authenticated, redirect to signup
      navigate('/signup');
      return;
    }

    if (!locationData) {
      // If authenticated but no location, request location
      setLocationLoading(true);
      try {
        await getCurrentLocation(true); // Force refresh location
      } catch (error) {
        console.error('Failed to get location:', error);
        // Even if location fails, we can still proceed
      } finally {
        setLocationLoading(false);
      }
    }
  };

  // Determine button text and action
  const getButtonConfig = () => {
    if (!isAuthenticated) {
      return {
        text: "Get Started",
        show: true,
        disabled: false
      };
    }

    if (isLoading || locationLoading) {
      return {
        text: "Getting Location...",
        show: true,
        disabled: true
      };
    }

    if (!locationData) {
      return {
        text: "Enable Location Access",
        show: true,
        disabled: false
      };
    }

    // Location is set, don't show button
    return {
      text: "",
      show: false,
      disabled: false
    };
  };

  const buttonConfig = getButtonConfig();

    return(
        <section 
          className="flex flex-col items-center text-center py-20 bg-gradient-to-r from-blue-100 to-blue-200"
          style={{
            backgroundImage: cycloneImg ? `linear-gradient(rgba(59, 130, 246, 0.7), rgba(147, 197, 253, 0.7)), url(${cycloneImg})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-black drop-shadow-lg">AI-Powered Disaster Management System</h1>
        <p className="text-lg md:text-xl max-w-2xl text-black drop-shadow-md">
          Predict, detect, and respond to natural disasters in real-time using satellite data, machine learning, and location intelligence.
        </p>
        
        {/* Location Status Display */}
        {isAuthenticated && locationData && (
          <div className="mt-6 bg-white bg-opacity-90 backdrop-blur-sm rounded-xl px-6 py-3 shadow-md">
            <div className="flex items-center justify-center gap-2">
              <span className="text-green-500 text-lg">📍</span>
              <span className="text-gray-800 font-semibold">
                Monitoring disasters for {locationData.city}
              </span>
            </div>
          </div>
        )}

        {/* Get Started Button */}
        {buttonConfig.show && (
          <button 
            onClick={handleGetStarted}
            disabled={buttonConfig.disabled}
            className="mt-8 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {(isLoading || locationLoading) && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            )}
            {buttonConfig.text}
          </button>
        )}

        {/* Additional Info for Location Request */}
        {isAuthenticated && !locationData && !isLoading && !locationLoading && (
          <p className="mt-4 text-sm text-gray-700 bg-white bg-opacity-80 backdrop-blur-sm rounded-lg px-4 py-2 max-w-md">
            📍 Enable location access to receive personalized disaster alerts for your area
          </p>
        )}
      </section>
    );
}

export default HeroSection;