import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { useLocationContext } from "../userSystem/LocationContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../userSystem/AuthContext";

function LiveAlerts() {
    const { locationData, isLoading } = useLocationContext();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

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
    const [apiConnectionError, setApiConnectionError] = useState(false);

    // Use refs to prevent multiple API calls
    const isInitialLoadRef = useRef(true);
    const lastFetchTimeRef = useRef(0);
    const abortControllerRef = useRef(null);

    const today = useMemo(() => new Date().toISOString().split("T")[0], []);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    // Check API connection
    const checkApiConnection = useCallback(async () => {
        if (!API_BASE_URL) {
            setApiConnectionError(true);
            setError('API configuration is missing. Please check your environment variables.');
            return false;
        }

        try {
            // Simple health check - try to reach the API base URL
            const response = await fetch(`${API_BASE_URL}/`, {
                method: 'HEAD',
                timeout: 5000
            });
            setApiConnectionError(false);
            return true;
        } catch (err) {
            console.error('API connection check failed:', err);
            setApiConnectionError(true);
            setError('Cannot connect to the backend server. Please ensure the API server is running.');
            return false;
        }
    }, [API_BASE_URL]);

    // Prevent rapid successive API calls
    const shouldFetchData = useCallback(() => {
        const now = Date.now();
        const timeSinceLastFetch = now - lastFetchTimeRef.current;
        const minInterval = 2000; // Minimum 2 seconds between API calls
        
        return timeSinceLastFetch > minInterval;
    }, []);

    // Enhanced error handling function
    const handleApiError = useCallback((error, context) => {
        console.error(`${context} error:`, error);
        
        if (error.name === 'AbortError') {
            console.log(`${context} API call was aborted`);
            return null;
        }

        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            return `Request timeout. The server is taking too long to respond.`;
        }
        
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
            setApiConnectionError(true);
            return `Cannot connect to the backend server. Please check if the API server is running at ${API_BASE_URL}`;
        }
        
        if (error.response) {
            const { status } = error.response;
            switch (status) {
                case 404:
                    return `${context} endpoint not found. Please check the API configuration.`;
                case 500:
                    return `Server error. Please try again later.`;
                case 503:
                    return `Service temporarily unavailable. Please try again later.`;
                default:
                    return `${context} failed with status ${status}. Please try again.`;
            }
        }
        
        return `Unable to load ${context.toLowerCase()} data. Please check your connection and try again.`;
    }, [API_BASE_URL]);

    // Memoize the fetch functions with stable dependencies
    const fetchCycloneData = useCallback(async (signal) => {
        if (!locationData?.city || !isAuthenticated || !API_BASE_URL) return;
        
        try {
            console.log('Fetching cyclone data for:', locationData.city);
            const res = await axios.get(
                `${API_BASE_URL}/feature/get_cyclone_data/?location=${locationData.city}&end_date=${today}`,
                { 
                    timeout: 10000,
                    signal // Pass abort signal
                }
            );
            
            const wind = res.data.data.cyclone_data.wind.speed;
            const pressure = res.data.data.cyclone_data.main.pressure;
            
            setWindSpeed((wind * 3.6).toFixed(2));
            setWindPressure(pressure);
            setLastUpdated(Date.now());
            setCyclonePrediction(res.data.data.prediction || '');
            setCycloneError('');
        } catch (err) {
            const errorMessage = handleApiError(err, 'Cyclone data');
            if (errorMessage) {
                setCycloneError(errorMessage);
            }
        }
    }, [locationData?.city, today, API_BASE_URL, isAuthenticated, handleApiError]);

    const fetchEarthquakeData = useCallback(async (signal) => {
        if (!locationData?.city || !isAuthenticated || !API_BASE_URL) return;

        try {
            console.log('Fetching earthquake data for:', locationData.city);
            const res = await axios.get(
                `${API_BASE_URL}/feature/get_location_earthquake_historical_data/?location=${locationData.city}`,
                { 
                    timeout: 15000,
                    signal, // Pass abort signal
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
            setEarthquakeError('');
        } catch (error) {
            const errorMessage = handleApiError(error, 'Earthquake prediction');
            if (errorMessage) {
                setEarthquakeError(errorMessage);
            }
        }
    }, [locationData?.city, API_BASE_URL, isAuthenticated, handleApiError]);

    const fetchCyclonePrediction = useCallback(async (signal) => {
        if (!locationData?.city || !isAuthenticated || !API_BASE_URL) return;

        try {
            console.log('Fetching cyclone prediction for:', locationData.city);
            const res = await axios.get(
                `${API_BASE_URL}/feature/get_cyclone_prediction/?location=${locationData.city}&end_date=${today}`,
                { 
                    timeout: 10000,
                    signal // Pass abort signal
                }
            );
            
            const cyclonePrediction = res.data.data.CyclonePrediction;
            setCyclonePrediction(cyclonePrediction);
            setCycloneError('');
        } catch (error) {
            const errorMessage = handleApiError(error, 'Cyclone prediction');
            if (errorMessage) {
                setCycloneError(errorMessage);
            }
        }
    }, [locationData?.city, today, API_BASE_URL, isAuthenticated, handleApiError]);

    // Function to refresh all data with abort controller
    const refreshData = useCallback(async () => {
        if (!isAuthenticated || !locationData?.city || !shouldFetchData()) {
            console.log('Skipping data fetch - conditions not met or too soon');
            return;
        }
        
        // Check API connection first
        const isConnected = await checkApiConnection();
        if (!isConnected) {
            return;
        }
        
        // Abort any ongoing requests
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        // Create new abort controller
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;
        
        setDataLoading(true);
        setError('');
        lastFetchTimeRef.current = Date.now();
        
        try {
            console.log('Starting data refresh...');
            await Promise.allSettled([
                fetchCycloneData(signal),
                fetchEarthquakeData(signal),
                fetchCyclonePrediction(signal)
            ]);
            console.log('Data refresh completed');
        } finally {
            setDataLoading(false);
        }
    }, [isAuthenticated, locationData?.city, shouldFetchData, checkApiConnection, fetchCycloneData, fetchEarthquakeData, fetchCyclonePrediction]);

    // Single effect for initial data loading - only run once when conditions are met
    useEffect(() => {
        // Skip if still loading location or not authenticated
        if (isLoading || !locationData?.city || !isAuthenticated) {
            return;
        }

        // Skip if this is not the initial load and we've already fetched data recently
        if (!isInitialLoadRef.current && !shouldFetchData()) {
            console.log('Skipping duplicate API call - too soon since last fetch');
            return;
        }

        console.log('Initial data load triggered for:', locationData.city);
        
        setCycloneError('');
        setEarthquakeError('');

        // Mark that initial load has been attempted
        isInitialLoadRef.current = false;
        
        refreshData();

        // Cleanup function to abort requests if component unmounts
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [isLoading, locationData?.city, isAuthenticated]); // Minimal dependencies

    // Auto-refresh data every 5 minutes - separate from initial load
    useEffect(() => {
        if (!isAuthenticated || !locationData?.city || isInitialLoadRef.current || apiConnectionError) {
            return;
        }

        console.log('Setting up auto-refresh interval');
        const interval = setInterval(() => {
            console.log('Auto-refresh triggered');
            refreshData();
        }, 5 * 60 * 1000); // 5 minutes

        return () => {
            console.log('Clearing auto-refresh interval');
            clearInterval(interval);
        };
    }, [isAuthenticated, locationData?.city, refreshData, apiConnectionError]);

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

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

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
            
            {/* API Connection Error */}
            {apiConnectionError && (
                <div className="max-w-2xl mx-auto mb-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <span className="text-2xl">🚫</span>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Backend Server Not Available
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>Cannot connect to the API server at <code className="bg-red-100 px-1 rounded">{API_BASE_URL}</code></p>
                                    <p className="mt-1">Please ensure:</p>
                                    <ul className="list-disc list-inside mt-1 space-y-1">
                                        <li>The backend server is running</li>
                                        <li>The API URL is correct in your .env file</li>
                                        <li>There are no firewall or network issues</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Refresh Button */}
            <div className="flex justify-center mb-4">
                <button
                    onClick={refreshData}
                    disabled={dataLoading || apiConnectionError}
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
                    <div className="text-red-600">
                        <p className="font-semibold">⚠️ Cyclone Data Unavailable</p>
                        <p className="text-sm mt-1">{cycloneError}</p>
                    </div>
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
            {!apiConnectionError && (
                <div className="text-center mt-4">
                    <p className="text-xs text-gray-500">
                        🔄 Data automatically refreshes every 5 minutes
                    </p>
                </div>
            )}
        </section>
    );
}

export default LiveAlerts;