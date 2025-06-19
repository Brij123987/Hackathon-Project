import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function UserLogin() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        rememberMe: false,
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [apiConnectionError, setApiConnectionError] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    console.log("API_BASE_URL", API_BASE_URL)

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    // Check API connection
    const checkApiConnection = async () => {
        if (!API_BASE_URL) {
            setApiConnectionError(true);
            setMessage("❌ API configuration is missing. Please check your environment variables.");
            return false;
        }

        try {
            // Simple health check
            // const response = await fetch(`${API_BASE_URL}/`, {
            //     method: 'HEAD',
            //     timeout: 5000
            // });
            setApiConnectionError(false);
            return true;
        } catch (err) {
            console.error('API connection check failed:', err);
            setApiConnectionError(true);
            setMessage(`❌ Cannot connect to the backend server at ${API_BASE_URL}. Please ensure the API server is running.`);
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setApiConnectionError(false);

        // Check API connection first
        const isConnected = await checkApiConnection();
        if (!isConnected) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                `${API_BASE_URL}/user/login/`, 
                {
                    username: formData.username.trim(),
                    password: formData.password,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 10000
                }
                );
                console.log("Test")

            const token = response.data.access_token;

            // Use the auth context login method
            login(token, formData.rememberMe);

            setMessage("✅ Logged in successfully!");
            
            setTimeout(() => {
                navigate("/");
            }, 1500);

        } catch (error) {
            console.error("Login error:", error);
        if (error.response) {
            const { status } = error.response;
            if (status === 401) {
                setMessage("❌ Invalid username or password.");
            } 
            else if (status >= 500) {
                setMessage("❌ Server error. Please try again later.");
            } else {
                setMessage("❌ Login failed. Please try again.");
            }
            } else {
            setMessage("❌ Network error. Please check your internet connection.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                </div>

                {/* API Connection Status */}
                {apiConnectionError && (
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
                                    <p>Cannot connect to: <code className="bg-red-100 px-1 rounded">{API_BASE_URL}</code></p>
                                    <p className="mt-1">Please ensure the backend server is running and accessible.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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

                        <div className="flex items-center">
                            <input
                                id="rememberMe"
                                name="rememberMe"
                                type="checkbox"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                                Remember me
                            </label>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading || apiConnectionError}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </div>

                    {message && (
                        <div className={`mt-4 p-3 rounded-md text-sm ${
                            message.includes('✅') 
                                ? 'bg-green-50 text-green-800 border border-green-200' 
                                : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                            {message}
                        </div>
                    )}

                    <div className="text-center">
                        <span className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/signup')}
                                className="font-medium text-blue-600 hover:text-blue-500"
                            >
                                Sign up
                            </button>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UserLogin;