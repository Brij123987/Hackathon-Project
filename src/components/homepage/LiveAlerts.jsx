import React, { useEffect, useState } from "react";
import axios from "axios";

function LiveAlerts() {
    const [windSpeed, setWindSpeed] = useState(null);
    const [windPressure, setWindPressure] = useState(null);
    const [windTime, setWindTime] = useState(null);
    const [timeDifference, setTimeDifference] = useState('');

    const [cyclonePrediction, setCyclonePrediction] = useState('');

    // EarthQuake Data 

    const [predictedMagnitude, setPredictedMagnitude] = useState(null);
    const [expectedInHours, setExpectedInHours] = useState(null);
    const [earthQuakePrediction, setEarthQuakePrediction] = useState(null);

    useEffect(() => {
        axios.get("http://127.0.0.1:8000/feature/get_cyclone_data/?location=mumbai&end_date=2025-06-17")
            .then((res) => {
                const wind = res.data.data.cyclone_data.wind.speed;
                const pressure = res.data.data.cyclone_data.main.pressure;
                const windTime = res.data.data.cyclone_data.dt;


                setWindSpeed(parseFloat((wind * 3.6).toFixed(2)));
                setWindPressure(pressure);
                setWindTime(windTime);
            })
            .catch((error) => {
                console.error("Error fetching cyclone data:", error);
            });
    }, []);

    useEffect(() => {
        if (windTime) {
          const now = Math.floor(Date.now() / 1000); // Current time in seconds
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
        axios.get("http://127.0.0.1:8000/feature/get_location_earthquake_historical_data/?location=japan")
        .then((res) => {
            const predictedMagnitude = res.data.data.predict_next_earthquake.PredictedMagnitude;
            const expectedInHours = res.data.data.predict_next_earthquake.ExpectedInHours;
            const earthQuakePrediction = res.data.data.predicted_data[0]
            
            setPredictedMagnitude(predictedMagnitude);
            setExpectedInHours(expectedInHours);
            setEarthQuakePrediction(earthQuakePrediction);

        })
        .catch((error) => {
            console.error('Error in Fetching Earthquake Prediction', error);
        })


    }, []); 

    useEffect(() => {
        axios.get("http://127.0.0.1:8000/feature/get_cyclone_prediction/?location=mumbai&end_date=2025-06-17")
        .then((res) => {
            const cyclonePrediction = res.data.data.CyclonePrediction;
            
            setCyclonePrediction(cyclonePrediction);

        })
        .catch((error) => {
            console.log("Error in Getting Cyclone Prediction", error);
        })
    }, [])

    return (
        <section id="alerts" className="py-16 px-6 md:px-20 bg-blue-50">
            <h2 className="text-3xl font-bold mb-8 text-center">Live Disaster Alerts</h2>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <p className="text-lg font-semibold">
                {cyclonePrediction === "Cyclone is likely to develop in this region." ? (
                    <span className="text-red-600">🚨 Cyclone Warning near Bay of Bengal</span>
                ) : (
                    <span className="text-green-600">✅ No Cyclone Detected near Bay of Bengal</span>
                )}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                    Wind speed: {windSpeed ? `${windSpeed} km/h` : "Loading..."} |{" "}
                    Pressure: {windPressure ? `${windPressure} hPa` : "Loading..."} | Updated: {timeDifference ? `${timeDifference}`: "Loading..."}
                </p>
            </div>
            <br />
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
                <p className="text-lg font-semibold text-red-600">🚨 EarthQuake Warning near Bay of Bengal</p>
                <p className="text-sm text-gray-600 mt-2">
                    Predicted Magnitude: {predictedMagnitude ? `${predictedMagnitude}` : "Loading..."} | Expected In Hours: {expectedInHours ? `${expectedInHours}` : "Loading..."} | EarthQuake Prediction: {earthQuakePrediction ? `${earthQuakePrediction}` : "Loading..."}
                </p>
            </div>
        </section>
    );
}

export default LiveAlerts;
