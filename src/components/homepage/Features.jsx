import { useNavigate } from "react-router-dom";
import { useAuth } from "../userSystem/AuthContext";
import { useLocationContext } from "../userSystem/LocationContext";

function Features () {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { locationData, getCurrentLocation, isLoading } = useLocationContext();

    const handleTrackDisasters = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        // If no location data, get it
        if (!locationData) {
            try {
                await getCurrentLocation();
            } catch (error) {
                console.error('Error getting location:', error);
            }
        }

        console.log("Tracking disasters using current location:", locationData?.city);
        // You can add additional tracking logic here
    };

    const handleGraphView = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        navigate('/graphs');
    }

    return (
        <section id="features" className="py-16 px-6 md:px-20 bg-white">
            <h2 className="text-3xl font-bold mb-10 text-center">Core Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
                <div className="p-6 bg-gray-100 rounded-xl shadow-sm">
                    <h3 className="text-xl font-semibold mb-2">Real-time Alerts</h3>
                    <p>Stay informed with instant notifications for earthquakes, cyclones, floods, and more.</p>
                    
                    {isAuthenticated ? (
                        <>
                            {locationData ? (
                                <p className="text-sm text-green-600 mb-4 italic">
                                    📍 Location set: {locationData.city}. Click to track disasters in your area.
                                </p>
                            ) : (
                                <p className="text-sm text-blue-600 mb-4 italic">
                                    📍 Click to set up location-based disaster tracking.
                                </p>
                            )}
                        </>
                    ) : (
                        <p className="text-sm text-blue-600 mb-4 italic">
                            🔒 Sign in required to access real-time disaster tracking for your location.
                        </p>
                    )}

                    <button
                        onClick={handleTrackDisasters}
                        disabled={isAuthenticated && isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {isAuthenticated ? 
                            (isLoading ? 'Getting Location...' : 'Track Nearby Disasters') 
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
    );
}

export default Features;