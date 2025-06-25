import { useNavigate } from "react-router-dom";
import { useAuth } from "../userSystem/AuthContext";
import { useLocationContext } from "../userSystem/LocationContext";
import { useState } from "react";
import DisasterTrackingPopup from "../userSystem/DisasterTrackingPopup";
import axios from "axios";

function Features () {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { locationData, getCurrentLocation, isLoading } = useLocationContext();
    const [showTrackingPopup, setShowTrackingPopup] = useState(false);
    const [trackingSetupComplete, setTrackingSetupComplete] = useState(false);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const handleTrackDisasters = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        // Show the tracking popup
        setShowTrackingPopup(true);
    };

    const handleTrackingSubmit = async (trackingData) => {
        try {
            console.log("Setting up disaster tracking with data:", trackingData);
            
            // Here you would typically send this data to your backend
            // For now, we'll just simulate the setup
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Mark tracking as complete
            setTrackingSetupComplete(true);
            setShowTrackingPopup(false);
            
            // Show success message or redirect
            alert(`✅ Disaster tracking activated!\n\nMobile: ${trackingData.countryCode} ${trackingData.mobileNumber}\nLocation: ${trackingData.location?.city || 'Unknown'}\n\nYou'll receive SMS alerts for disasters in your area.`);
            
        } catch (error) {
            console.error('Error setting up tracking:', error);
            throw error; // Let the popup handle the error
        }
    };

    const handleGraphView = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        navigate('/graphs');
    }

    const handleStopTracking = async () => {

        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (!token) throw new Error("Authentication token not found");

        try{
            await axios.post(`${API_BASE_URL}/user/stop-tracking/`, {}, 
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
            });
            setTrackingSetupComplete(false);
            alert('🚫 Disaster tracking stopped.');
        } catch (err) {
            console.error('Error stopping tracking:', err);
            alert('❌ Failed to stop tracking.');
        }
        
    };

    return (
        <>
            <section id="features" className="py-16 px-6 md:px-20 bg-white">
                <h2 className="text-3xl font-bold mb-10 text-center">Core Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
                    <div className="p-6 bg-gray-100 rounded-xl shadow-sm">
                        <h3 className="text-xl font-semibold mb-2">Real-time Alerts</h3>
                        <p>Stay informed with instant notifications for earthquakes, cyclones, floods, and more.</p>
                        
                        {isAuthenticated ? (
                            <>
                                {trackingSetupComplete ? (
                                    <>
                                        <p className="text-sm text-green-600 mb-4 italic">
                                            ✅ Disaster tracking is active! You'll receive SMS alerts for your area.
                                        </p>
                                        <button
                                            onClick={handleStopTracking}
                                            className="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                        >
                                            🛑 Stop Tracking
                                        </button>
                                    </>
                                ) : locationData ? (
                                    <p className="text-sm text-green-600 mb-4 italic">
                                        📍 Location set: {locationData.city}. Click to set up SMS alerts for disasters in your area.
                                    </p>
                                ) : (
                                    <p className="text-sm text-blue-600 mb-4 italic">
                                        📍 Click to set up location-based disaster tracking with SMS alerts.
                                    </p>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-blue-600 mb-4 italic">
                                🔒 Sign in required to access real-time disaster tracking with SMS alerts.
                            </p>
                        )}

                        <button
                            onClick={handleTrackDisasters}
                            disabled={isAuthenticated && isLoading}
                            className={`px-4 py-2 text-white rounded-md font-medium transition disabled:opacity-50 ${
                                trackingSetupComplete 
                                    ? 'bg-green-600 hover:bg-green-700' 
                                    : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {isAuthenticated ? 
                                (isLoading ? 'Getting Location...' : 
                                 trackingSetupComplete ? 'Tracking Active ✅' : 'Track Nearby Disasters') 
                                : 'Sign In to Track'
                            }
                        </button>
                    </div>

                    <div className="p-6 bg-gray-100 rounded-xl shadow-sm">
                        <h3 className="text-xl font-semibold mb-2">Disaster Prediction</h3>
                        <p>Predict natural disasters using historical data and AI models with high accuracy.</p>
                        
                        {isAuthenticated ? (
                            locationData ? (
                                <p className="text-sm text-green-600 mb-4 italic">
                                    🤖 AI predictions available for {locationData.city}.
                                </p>
                            ) : (
                                <p className="text-sm text-blue-600 mb-4 italic">
                                    🤖 Location needed for personalized AI predictions.
                                </p>
                            )
                        ) : (
                            <>
                                <p className="text-sm text-blue-600 mb-4 italic">
                                    🔒 Create an account to access AI-powered disaster predictions.
                                </p>
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition"
                                >
                                    Get Started
                                </button>
                            </>
                        )}
                    </div>

                    <div className="p-6 bg-gray-100 rounded-xl shadow-sm">
                        <h3 className="text-xl font-semibold mb-2">Interactive Graphs</h3>
                        <p>Visualize affected areas using satellite imagery and geospatial overlays.</p>

                        <br></br>
                        {isAuthenticated ? (
                            locationData ? (
                                <p className="text-sm text-green-600 mb-4 italic">
                                    📊 View disaster graphs and data for {locationData.city}.
                                </p>
                            ) : (
                                <p className="text-sm text-blue-600 mb-4 italic">
                                    📊 Location needed to display relevant disaster graphs.
                                </p>
                            )
                        ) : (
                            <p className="text-sm text-blue-600 mb-4 italic">
                                🔒 Sign in to view interactive disaster graphs for your location.
                            </p>
                        )}
                        
                        <button
                            onClick={handleGraphView}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition"
                        >
                            {isAuthenticated ? 'Graph View' : 'Sign In for Graphs'}
                        </button>
                    </div>
                </div>
            </section>

            {/* Disaster Tracking Popup */}
            <DisasterTrackingPopup
                isOpen={showTrackingPopup}
                onClose={() => setShowTrackingPopup(false)}
                onSubmit={handleTrackingSubmit}
            />
        </>
    );
}

export default Features;