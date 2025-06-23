import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useLocationContext } from "../userSystem/LocationContext";
import { useAuth } from "../userSystem/AuthContext";

function HeroSection () {

  const { locationData, isLoading } = useLocationContext();
  const { isAuthenticated } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [cycloneImg, setCycloneImage] = useState('');


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
        <button className="mt-8 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow hover:bg-blue-700 transition">
          Get Started
        </button>
      </section>
    );
}

export default HeroSection;