
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLocationContext } from "./LocationContext";

function UserRegistration() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");                 // feedback banner
  const [locationStep, setLocationStep] = useState(false);    // true ⇒ showing spinner once permission granted
  const [askForLocation, setAskForLocation] = useState(false); // true ⇒ show “Allow / Skip” buttons

  // ────────────────────────────────────
  // Context / env / helpers
  // ────────────────────────────────────
  const navigate = useNavigate();
  const { getCurrentLocation, locationData } = useLocationContext();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // ────────────────────────────────────
  // Form helpers
  // ────────────────────────────────────
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateForm = () => {
    if (formData.password !== formData.confirm_password)
      return setMessage("❌ Passwords do not match"), false;

    if (formData.password.length < 6)
      return setMessage("❌ Password must be at least 6 characters long"), false;

    if (!formData.email.includes("@"))
      return setMessage("❌ Please enter a valid email address"), false;

    if (formData.username.length < 3)
      return setMessage("❌ Username must be at least 3 characters long"), false;

    return true;
  };

  // ────────────────────────────────────
  // LOCATION ― user clicked “Yes, allow location”
  // ────────────────────────────────────
  const handleLocationSetup = async () => {
    setLocationStep(true);
    setMessage("📍 Setting up your location for personalized disaster alerts…");

    try {
      const location = await getCurrentLocation(); // triggers the browser prompt
      if (location?.city) {
        setMessage(
          `✅ Location set to ${location.city}! You'll receive alerts for this area.`
        );
      } else {
        setMessage("⚠️ Location setup completed with fallback.");
      }
    } catch (err) {
      console.error("Location setup error:", err);
      setMessage(
        "⚠️ Location setup optional. You'll still receive general alerts."
      );
    } finally {
      // send the user to login either way
      setTimeout(() => navigate("/login"), 2000);
    }
  };

  // ────────────────────────────────────
  // LOCATION ― user clicked “Skip”
  // ────────────────────────────────────
  const handleSkipLocation = () => {
    setMessage("⚠️ Location access skipped. You'll get general alerts.");
    setTimeout(() => navigate("/login"), 2000);
  };

  // ────────────────────────────────────
  // SUBMIT
  // ────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/user/register/`,
        {
          username: formData.username.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          confirm_password: formData.confirm_password,
        },
        { headers: { "Content-Type": "application/json" }, timeout: 10000 }
      );

      if (response.status === 200 || response.status === 201) {
        setMessage("✅ Account created successfully!");
        // Wait a second for UX, then ask if they want location
        setTimeout(() => setAskForLocation(true), 1000);
      }
    } catch (err) {
      console.error("Registration error:", err);
      if (err.response) {
        const { status, data } = err.response;
        if (status === 400 && data) {
          let errorMessage = "❌ Registration failed:\n";
          if (typeof data === "object") {
            Object.entries(data).forEach(([field, messages]) => {
              errorMessage += `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}\n`;
            });
          } else errorMessage += data.toString();
          setMessage(errorMessage);
        } else if (status >= 500) setMessage("❌ Server error. Please try again later.");
        else setMessage(`❌ Registration failed. Error: ${status}`);
      } else if (err.request) setMessage("❌ Server Error. Please try again later.");
      else setMessage("❌ An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────
  // RENDER
  // ────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* ───────────────── Header ───────────────── */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          {locationStep && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Setting up location for personalized alerts…
            </p>
          )}
        </div>

        {/* ───────────────── Step 1: Registration form ───────────────── */}
        {!askForLocation && !locationStep && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Inputs */}
            {/* Username */}
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
                  className="mt-1 block w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Email */}
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
                  className="mt-1 block w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Password */}
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
                  className="mt-1 block w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Confirm Password */}
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
                  className="mt-1 block w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Location notice banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <span className="text-blue-400 text-lg mr-2">📍</span>
                <div>
                  <h3 className="text-sm font-medium text-blue-800">
                    Location-based alerts
                  </h3>
                  <p className="mt-1 text-sm text-blue-700">
                    After registration we’ll ask permission to detect your location so you get earthquake, cyclone &amp; weather alerts tailored to your area.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24" />
                  Creating Account…
                </span>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Link to login */}
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </button>
            </p>
          </form>
        )}

        {/* ───────────────── Step 2: Ask for location permission ───────────────── */}
        {askForLocation && !locationStep && (
          <div className="space-y-6">
            <h3 className="text-center text-lg font-medium text-gray-800">
              Allow location access?
            </h3>
            <p className="text-sm text-gray-600 text-center">
              We use your browser’s location so we can send you personalized disaster alerts. You can skip and receive generic alerts.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleLocationSetup}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Yes, allow
              </button>
              <button
                onClick={handleSkipLocation}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {/* ───────────────── Step 3: Location spinner / success ───────────────── */}
        {locationStep && (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              {locationData ? (
                <span className="text-2xl">✅</span>
              ) : (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              )}
            </div>
            {locationData && (
              <p className="text-sm text-green-700">
                Location detected: <strong>{locationData.city}</strong>
              </p>
            )}
          </div>
        )}

        {/* ───────────────── Message banner (success / error) ───────────────── */}
        {message && (
          <div
            className={`p-3 rounded-md text-sm whitespace-pre-line ${
              message.includes("✅")
                ? "bg-green-50 text-green-800 border border-green-200"
                : message.includes("⚠️")
                ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
                : message.includes("📍")
                ? "bg-blue-50 text-blue-800 border border-blue-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserRegistration;
