import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EarthquakeLineChart from "./EarthquakeLineChart";
import CycloneLineChart from "./CycloneLineChart";
import { useLocationContext } from "../userSystem/LocationContext";
import { useAuth } from "../userSystem/AuthContext";

const GraphView = ({ location }) => {
  const [activeTab, setActiveTab] = useState("earthquake");
  const { isAuthenticated } = useAuth();
  const { locationData } = useLocationContext();
  const navigate = useNavigate();

  // Empty state for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center border-2 border-dashed border-gray-200">
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Access Restricted
              </h2>
              <p className="text-gray-600 mb-6">
                Interactive disaster graphs and data visualization are available to registered users only. 
                Sign in to view earthquake and cyclone data for your location.
              </p>
            </div>

            {/* Feature Preview */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">What you'll get:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Real-time earthquake magnitude charts</li>
                <li>• Cyclone wind speed & pressure graphs</li>
                <li>• Historical disaster data analysis</li>
                <li>• Export data as CSV or PDF</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="w-full px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
              >
                Create Account
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors text-sm"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 bg-white rounded-md shadow-md">
        <h2 className="text-2xl font-bold text-center mb-4">
          📊 Disaster Graphs for <span className="text-blue-600">{locationData?.city}</span>
        </h2>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab("earthquake")}
            className={`px-4 py-2 rounded-md font-medium ${
              activeTab === "earthquake" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            Earthquake
          </button>
          <button
            onClick={() => setActiveTab("cyclone")}
            className={`px-4 py-2 rounded-md font-medium ${
              activeTab === "cyclone" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            Cyclone
          </button>
        </div>
      </div>

      {/* Full-width chart below header block */}
      {activeTab === "earthquake" ? (
        <EarthquakeLineChart location={locationData?.city || location} />
      ) : (
        <CycloneLineChart location={locationData?.city || location} />
      )}
    </>
  );
};

export default GraphView;