import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLocationContext } from "./LocationContext";

function UserRegistration() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirm_password: ""
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [locationStep, setLocationStep] = useState(false);
    const navigate = useNavigate();

    const { getCurrentLocation, locationData } = useLocationContext();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        if (formData.password !== formData.confirm_password) {
            setMessage("❌ Passwords do not match");
            return false;
        }
        if (formData.password.length < 6) {
            setMessage("❌ Password must be at least 6 characters long");
            return false;
        }
        if (!formData.email.includes('@')) {
            setMessage("❌ Please enter a valid email address");
            return false;
        }
        if (formData.username.length < 3) {
            setMessage("❌ Username must be at least 3 characters long");
            return false;
        }
        return true;
    };

    const handleLocationSetup = async () => {
        setLocationStep(true);
        setMessage("📍 Setting up your location for personalized disaster alerts...");
        
        try {
            const location = await getCurrentLocation();
            
            if (location && location.city) {
                setMessage(`✅ Location set to ${location.city}! You'll receive disaster alerts for this area.`);
                
                setTimeout(() => {
                    setMessage("✅ Registration complete! Redirecting to login...");
                    setTimeout(() => {
                        navigate("/login");
                    }, 1500);
                }, 2000);
            } else {
                setMessage("⚠️ Location setup completed with fallback. Redirecting to login...");
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            }
        } catch (error) {
            console.error('Location setup error:', error);
            setMessage("⚠️ Location setup optional. Registration successful! Redirecting to login...");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            // Prepare registration data
            const registrationData = {
                username: formData.username.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
                confirm_password: formData.confirm_password
            };

            const response = await axios.post(
                `${API_BASE_URL}/user/register/`, 
                registrationData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 10000 // 10 second timeout
                }
            );

            if (response.status === 200 || response.status === 201) {
                setMessage("✅ Account created successfully!");
                setLoading(false);
                
                // Automatically proceed to location setup
                setTimeout(() => {
                    handleLocationSetup();
                }, 1000);
            }

        } catch (err) {
            console.error('Registration error:', err);
            if (err.response) {
                // Server responded with error
                const { status, data } = err.response;
                
                if (status === 400 && data) {
                    // Handle validation errors
                    let errorMessage = "❌ Registration failed:\n";
                    
                    if (typeof data === 'object') {
                        Object.entries(data).forEach(([field, messages]) => {
                            if (Array.isArray(messages)) {
                                errorMessage += `${field}: ${messages.join(", ")}\n`;
                            } else {
                                errorMessage += `${field}: ${messages}\n`;
                            }
                        });
                    } else {
                        errorMessage += data.toString();
                    }
                    
                    setMessage(errorMessage);
                } else if (status >= 500) {
                    setMessage("❌ Server error. Please try again later.");
                } else {
                    setMessage(`❌ Registration failed. Error: ${status}`);
                }
            } else if (err.request) {
                // Network error
                setMessage("❌ Server Error. Please try after sometimes!!!");
            } else {
                setMessage("❌ An unexpected error occurred. Please try again.");
            }
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    {locationStep && (
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Setting up location for personalized alerts...
                        </p>
                    )}
                </div>

                {!locationStep ? (
                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    placeholder="Enter username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter email address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Enter password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirm_password"
                                    name="confirm_password"
                                    type="password"
                                    placeholder="Confirm password"
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Location Permission Notice */}
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <span className="text-blue-400 text-lg">📍</span>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">
                                        Location-Based Alerts
                                    </h3>
                                    <div className="mt-2 text-sm text-blue-700">
                                        <p>
                                            After registration, we'll request your location to provide personalized disaster alerts for your area. 
                                            This helps us deliver relevant earthquake, cyclone, and weather warnings.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating Account...
                                    </span>
                                ) : (
                                    "Create Account & Setup Location"
                                )}
                            </button>
                        </div>

                        <div className="text-center">
                            <span className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    className="font-medium text-blue-600 hover:text-blue-500"
                                >
                                    Sign in
                                </button>
                            </span>
                        </div>
                    </form>
                ) : (
                    // Location Setup Step
                    <div className="mt-8 space-y-6">
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                {locationData ? (
                                    <span className="text-2xl">✅</span>
                                ) : (
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                )}
                            </div>
                            
                            {locationData && (
                                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                                    <div className="flex items-center justify-center">
                                        <span className="text-green-400 text-lg mr-2">📍</span>
                                        <div>
                                            <h3 className="text-sm font-medium text-green-800">
                                                Location Detected: {locationData.city}
                                            </h3>
                                            <p className="text-sm text-green-700 mt-1">
                                                You'll receive disaster alerts for this area
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {message && (
                    <div className={`mt-4 p-3 rounded-md text-sm whitespace-pre-line ${
                        message.includes('✅') 
                            ? 'bg-green-50 text-green-800 border border-green-200' 
                            : message.includes('⚠️')
                            ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                            : message.includes('📍')
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserRegistration;