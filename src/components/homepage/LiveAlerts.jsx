import React, { useEffect, useState } from "react";
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

    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        if (isLoading || !locationData?.city) return;
        
        setDataLoading(true);
        setError('');
    
        const fetchCycloneData = async () => {
            try {
                const res = await axios.get(
                    `http://127.0.0.1:8000/feature/get_cyclone_data/?location=${locationData.city}&end_date=${today}`,
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
                setError('Failed to load cyclone data');
            }
        };

        fetchCycloneData();
    }, [locationData, isLoading, today]);

    useEffect(() => {
        if (windTime) {
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
        }
    }, [windTime]);

    useEffect(() => {
        if (isLoading || !locationData?.city) return;

        const fetchEarthquakeData = async () => {
            try {
                const res = await axios.get(
                    `http://127.0.0.1:8000/feature/get_location_earthquake_historical_data/?location=${locationData.city}`,
                    { timeout: 10000 }
                );
                
                const predictedMagnitude = res.data.data.predict_next_earthquake.PredictedMagnitude;
                const expectedInHours = res.data.data.predict_next_earthquake.ExpectedInHours;
                const earthQuakePrediction = res.data.data.predicted_data[0];
                
                setPredictedMagnitude(predictedMagnitude);
                setExpectedInHours(expectedInHours);
                setEarthQuakePrediction(earthQuakePrediction);
            } catch (error) {
                console.error('Error in Fetching Earthquake Prediction', error);
                setError('Failed to load earthquake data');
            }
        };

        fetchEarthquakeData();
    }, [locationData, isLoading]); 

    useEffect(() => {
        if (isLoading || !locationData?.city) return;

        const fetchCyclonePrediction = async () => {
            try {
                const res = await axios.get(
                    `http://127.0.0.1:8000/feature/get_cyclone_prediction/?location=${locationData.city}&end_date=${today}`,
                    { timeout: 10000 }
                );
                
                const cyclonePrediction = res.data.data.CyclonePrediction;
                setCyclonePrediction(cyclonePrediction);
            } catch (error) {
                console.log("Error in Getting Cyclone Prediction", error);
            } finally {
                setDataLoading(false);
            }
        };

        fetchCyclonePrediction();
    }, [locationData, isLoading, today]);

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

    if (error) {
        return (
            <section id="alerts" className="py-16 px-6 md:px-20 bg-blue-50">
                <h2 className="text-3xl font-bold mb-8 text-center">Live Disaster Alerts</h2>
                <div className="bg-white p-6 rounded-xl shadow-md text-center">
                    <p className="text-red-600">⚠️ {error}</p>
                </div>
            </section>
        );
    }

    let warningMessage = null;

    if (earthQuakePrediction === "Low") {
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
                        <p className="text-sm text-gray-600 mt-2">
                            Predicted Magnitude: {predictedMagnitude || "Loading..."} | 
                            Expected In Hours: {expectedInHours || "Loading..."} | 
                            EarthQuake Prediction: {earthQuakePrediction || "Loading..."}
                        </p>
                    </>
                )}
            </div>
        </section>
    );
}

export default LiveAlerts;