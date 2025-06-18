import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useLocationContext } from "../userSystem/LocationContext";
import { useNavigate } from "react-router-dom";

function LiveAlerts() {
    const { locationData, isLoading } = useLocationContext();
    const navigate = useNavigate();

    const [windSpeed, setWindSpeed] = useState(null);
    const [windPressure, setWindPressure] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
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

    // Check authentication status
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const today = useMemo(() => new Date().toISOString().split("T")[0], []);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    // Check if user is authenticated
    useEffect(() => {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        setIsAuthenticated(!!token);
    }, []);

    // Memoize the fetch functions to prevent recreation on every render
    const fetchCycloneData = useCallback(async () => {
        if (!locationData?.city || !isAuthenticated) return;
        
        try {
            const res = await axios.get(
                `${API_BASE_URL}/feature/get_cyclone_data/?location=${locationData.city}&end_date=${today}`,
                { timeout: 10000 }
            );
            
            const wind = res.data.data.cyclone_data.wind.speed;
            const pressure = res.data.data.cyclone_data.main.pressure;
            
            setWindSpeed((wind * 3.6).toFixed(2));
            setWindPressure(pressure);
            // Set the current time as last updated since API doesn't provide reliable timestamp
            setLastUpdated(Date.now());
            setCyclonePrediction(res.data.data.prediction || '');
            setCycloneError(''); // Clear any previous errors
        } catch (err) {
            console.error("Failed to fetch cyclone data:", err);
            setCycloneError('Unable to load cyclone data. Please check your connection.');
        }
    }, [locationData?.city, today, API_BASE_URL, isAuthenticated]);

    const fetchEarthquakeData = useCallback(async () => {
        if (!locationData?.city || !isAuthenticated) return;

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
            setEarthquakeError(''); // Clear any previous errors
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
    }, [locationData?.city, API_BASE_URL, isAuthenticated]);

    const fetchCyclonePrediction = useCallback(async () => {
        if (!locationData?.city || !isAuthenticated) return;

        try {
            const res = await axios.get(
                `${API_BASE_URL}/feature/get_cyclone_prediction/?location=${locationData.city}&end_date=${today}`,
                { timeout: 10000 }
            );
            
            const cyclonePrediction = res.data.data.CyclonePrediction;
            setCyclonePrediction(cyclonePrediction);
            setCycloneError(''); // Clear any previous errors
        } catch (error) {
            console.log("Error in Getting Cyclone Prediction", error);
            setCycloneError('Unable to load cyclone prediction data.');
        }
    }, [locationData?.city, today, API_BASE_URL, isAuthenticated]);

    // Function to refresh all data
    const refreshData = useCallback(async () => {
        if (!isAuthenticated || !locationData?.city) return;
        
        setDataLoading(true);
        try {
            await Promise.allSettled([
                fetchCycloneData(),
                fetchEarthquakeData(),
                fetchCyclonePrediction()
            ]);
        } finally {
            setDataLoading(false);
        }
    }, [isAuthenticated, locationData?.city, fetchCycloneData, fetchEarthquakeData, fetchCyclonePrediction]);

    // Single effect for initial data loading
    useEffect(() => {
        if (isLoading || !locationData?.city || !isAuthenticated) return;
        
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
    }, [isLoading, locationData?.city, isAuthenticated, fetchCycloneData, fetchEarthquakeData, fetchCyclonePrediction]);

    // Auto-refresh data every 5 minutes
    useEffect(() => {
        if (!isAuthenticated || !locationData?.city) return;

        const interval = setInterval(() => {
            console.log('Auto-refreshing disaster data...');
            refreshData();
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(interval);
    }, [isAuthenticated, locationData?.city, refreshData]);

    // Effect for time difference calculation
    useEffect(() => {
        if (!lastUpdated || !isAuthenticated) return;

        const updateTimeDifference = () => {
            const now = Date.now();
            const diffInSeconds = Math.floor((now - lastUpdated) / 1000);

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
        
        // Update every 30 seconds for more responsive time display
        const interval = setInterval(updateTimeDifference, 30000);
        
        return () => clearInterval(interval);
    }, [lastUpdated, isAuthenticated]);

    // Empty state for unauthenticated users
    if (!isAuthenticated) {
        return (
            <section id="alerts" className="py-16 px-6 md:px-20 bg-blue-50">
                <h2 className="text-3xl font-bold mb-8 text-center">Live Disaster Alerts</h2>
                
                <div className="max-w-2xl mx-auto">
                    {/* Empty State Card */}
                    <div className="bg-white p-8 rounded-xl shadow-md text-center border-2 border-dashed border-gray-200">
                        <div className="mb-6">
                            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <span className="text-4xl">🔒</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                Sign In Required
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Get real-time disaster alerts, earthquake predictions, and cyclone warnings for your location. 
                                Create an account or sign in to access live disaster monitoring.
                            </p>
                        </div>

                        {/* Preview Features */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg border">
                                <div className="flex items-center justify-center mb-2">
                                    <span className="text-2xl mr-2">🌪️</span>
                                    <span className="font-medium text-gray-700">Cyclone Alerts</span>
                                </div>
                                <p className="text-sm text-gray-500">Real-time wind speed & pressure monitoring</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border">
                                <div className="flex items-center justify-center mb-2">
                                    <span className="text-2xl mr-2">🌍</span>
                                    <span className="font-medium text-gray-700">Earthquake Predictions</span>
                                </div>
                                <p className="text-sm text-gray-500">AI-powered magnitude & timing forecasts</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => navigate('/signup')}
                                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                            >
                                Create Account
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
                            >
                                Sign In
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 mt-4">
                            Free account • Instant access • Location-based alerts
                        </p>
                    </div>
                </div>
            </section>
        );
    }

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
            
            {/* Refresh Button */}
            <div className="flex justify-center mb-4">
                <button
                    onClick={refreshData}
                    disabled={dataLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                >
                    {dataLoading ? (
                        <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Refreshing...
                        </>
                    ) : (
                        <>
                            🔄 Refresh Data
                        </>
                    )}
                </button>
            </div>
            
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
                            Updated: {timeDifference || "Just now"}
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

            {/* Auto-refresh indicator */}
            <div className="text-center mt-4">
                <p className="text-xs text-gray-500">
                    🔄 Data automatically refreshes every 5 minutes
                </p>
            </div>
        </section>
    );
}

export default LiveAlerts;