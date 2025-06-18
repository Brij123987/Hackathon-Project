import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useLocationContext } from "../userSystem/LocationContext";

function LiveAlerts() {
    const { locationData, isLoading } = useLocationContext();

    const [windSpeed, setWindSpeed] = useState(null);
    const [windPressure, setWindPressure] = useState(null);
    const [windTime, setWindTime] = useState(null);
    const [timeDifference, setTimeDifference] = useState('');

    const [cyclonePrediction, setCyclonePrediction] = useState('');

    // EarthQuake Data 
    const [predictedMagnitude, setPredictedMagnitude] = useState(null);
    const [expectedInHours, setExpectedInHours] = useState(null);
    const [earthQuakePrediction, setEarthQuakePrediction] = useState(null);

    const [dataLoading, setDataLoading] = useState(false);
    const [error, setError] = useState('');
    const [earthquakeError, setEarthquakeError] = useState('');
    const [cycloneError, setCycloneError] = useState('');

    const today = useMemo(() => new Date().toISOString().split("T")[0], []);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    // Memoize the fetch functions to prevent recreation on every render
    const fetchCycloneData = useCallback(async () => {
        if (!locationData?.city) return;
        
        try {
            const res = await axios.get(
                `${API_BASE_URL}/feature/get_cyclone_data/?location=${locationData.city}&end_date=${today}`,
                { timeout: 10000 }
            );
            
            const wind = res.data.data.cyclone_data.wind.speed;
            const pressure = res.data.data.cyclone_data.main.pressure;
            const timestamp = res.data.data.timestamp;

            setWindSpeed((wind * 3.6).toFixed(2));
            setWindPressure(pressure);
            setWindTime(Math.floor(timestamp));
            setCyclonePrediction(res.data.data.prediction || '');
        } catch (err) {
            console.error("Failed to fetch cyclone data:", err);
            setCycloneError('Unable to load cyclone data. Please check your connection.');
        }
    }, [locationData?.city, today, API_BASE_URL]);

    const fetchEarthquakeData = useCallback(async () => {
        if (!locationData?.city) return;

        try {
            if (!API_BASE_URL) {
                throw new Error('API base URL is not configured');
            }

            const res = await axios.get(
                `${API_BASE_URL}/feature/get_location_earthquake_historical_data/?location=${locationData.city}`,
                { 
                    timeout: 15000,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );
            
            const predictedMagnitude = res.data.data.predict_next_earthquake.PredictedMagnitude;
            const expectedInHours = res.data.data.predict_next_earthquake.ExpectedInHours;
            const earthQuakePrediction = res.data.data.predicted_data[0];
            
            setPredictedMagnitude(predictedMagnitude);
            setExpectedInHours(expectedInHours);
            setEarthQuakePrediction(earthQuakePrediction);
        } catch (error) {
            console.error('Error in Fetching Earthquake Prediction', error);
            
            if (error.code === 'ECONNABORTED') {
                setEarthquakeError('Request timeout. The server is taking too long to respond.');
            } else if (error.code === 'ERR_NETWORK') {
                setEarthquakeError('Network error. Please check if the backend server is running and accessible.');
            } else if (error.response?.status === 404) {
                setEarthquakeError('Earthquake data service not found.');
            } else if (error.response?.status >= 500) {
                setEarthquakeError('Server error. Please try again later.');
            } else if (!API_BASE_URL) {
                setEarthquakeError('API configuration missing. Please check environment variables.');
            } else {
                setEarthquakeError('Unable to load earthquake data. Please try again later.');
            }
        }
    }, [locationData?.city, API_BASE_URL]);

    const fetchCyclonePrediction = useCallback(async () => {
        if (!locationData?.city) return;

        try {
            const res = await axios.get(
                `${API_BASE_URL}/feature/get_cyclone_prediction/?location=${locationData.city}&end_date=${today}`,
                { timeout: 10000 }
            );
            
            const cyclonePrediction = res.data.data.CyclonePrediction;
            setCyclonePrediction(cyclonePrediction);
        } catch (error) {
            console.log("Error in Getting Cyclone Prediction", error);
            setCycloneError('Unable to load cyclone prediction data.');
        }
    }, [locationData?.city, today, API_BASE_URL]);

    // Single effect for initial data loading
    useEffect(() => {
        if (isLoading || !locationData?.city) return;
        
        setDataLoading(true);
        setError('');
        setCycloneError('');
        setEarthquakeError('');

        const loadAllData = async () => {
            try {
                await Promise.allSettled([
                    fetchCycloneData(),
                    fetchEarthquakeData(),
                    fetchCyclonePrediction()
                ]);
            } finally {
                setDataLoading(false);
            }
        };

        loadAllData();
    }, [isLoading, locationData?.city, fetchCycloneData, fetchEarthquakeData, fetchCyclonePrediction]);

    // Separate effect for time difference calculation
    useEffect(() => {
        if (!windTime) return;

        const updateTimeDifference = () => {
            const now = Math.floor(Date.now() / 1000);
            const diffInSeconds = now - windTime;

            let display = "";

            if (diffInSeconds < 60) {
                display = `${diffInSeconds} seconds ago`;
            } else if (diffInSeconds < 3600) {
                const minutes = Math.floor(diffInSeconds / 60);
                display = `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
            } else if (diffInSeconds < 86400) {
                const hours = Math.floor(diffInSeconds / 3600);
                display = `${hours} hour${hours !== 1 ? 's' : ''} ago`;
            } else {
                const days = Math.floor(diffInSeconds / 86400);
                display = `${days} day${days !== 1 ? 's' : ''} ago`;
            }

            setTimeDifference(display);
        };

        updateTimeDifference();
        
        // Update every minute instead of every second to reduce CPU usage
        const interval = setInterval(updateTimeDifference, 60000);
        
        return () => clearInterval(interval);
    }, [windTime]);

    if (isLoading) {
        return (
            <section id="alerts" className="py-16 px-6 md:px-20 bg-blue-50">
                <h2 className="text-3xl font-bold mb-8 text-center">Live Disaster Alerts</h2>
                <div className="bg-white p-6 rounded-xl shadow-md text-center">
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    </div>
                </div>
            </section>
        );
    }

    let warningMessage = null;

    if (earthquakeError) {
        warningMessage = (
            <p className="text-lg font-semibold text-red-600">
                ⚠️ {earthquakeError}
            </p>
        );
    } else if (earthQuakePrediction === "Low") {
        warningMessage = (
            <p className="text-lg font-semibold text-green-600">
                ✅ EarthQuake Risk is Low near {locationData?.city}
            </p>
        );
    } else if (earthQuakePrediction === "Medium") {
        warningMessage = (
            <p className="text-lg font-semibold text-orange-600">
                ⚠️ Moderate EarthQuake Risk near {locationData?.city}
            </p>
        );
    } else if (earthQuakePrediction === "High") {
        warningMessage = (
            <p className="text-lg font-semibold text-red-600">
                🚨 EarthQuake Warning near {locationData?.city}
            </p>
        );
    }

    return (
        <section id="alerts" className="py-16 px-6 md:px-20 bg-blue-50">
            <h2 className="text-3xl font-bold mb-8 text-center">Live Disaster Alerts</h2>
            
            {/* Cyclone Alert */}
            <div className="bg-white p-6 rounded-xl shadow-md text-center mb-4">
                {dataLoading ? (
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    </div>
                ) : cycloneError ? (
                    <p className="text-red-600">⚠️ {cycloneError}</p>
                ) : (
                    <>
                        <p className="text-lg font-semibold">
                            {cyclonePrediction === "Cyclone is likely to develop in this region." ? (
                                <span className="text-red-600">🚨 Cyclone Warning near {locationData?.city}</span>
                            ) : (
                                <span className="text-green-600">✅ No Cyclone Detected near {locationData?.city}</span>
                            )}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                            Wind speed: {windSpeed ? `${windSpeed} km/h` : "Loading..."} |{" "}
                            Pressure: {windPressure ? `${windPressure} hPa` : "Loading..."} | 
                            Updated: {timeDifference || "Loading..."}
                        </p>
                    </>
                )}
            </div>

            {/* Earthquake Alert */}
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
                {dataLoading ? (
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    </div>
                ) : (
                    <>
                        {warningMessage}
                        {!earthquakeError && (
                            <p className="text-sm text-gray-600 mt-2">
                                Predicted Magnitude: {predictedMagnitude || "Loading..."} | 
                                Expected In Hours: {expectedInHours || "Loading..."} | 
                                EarthQuake Prediction: {earthQuakePrediction || "Loading..."}
                            </p>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}

export default LiveAlerts;