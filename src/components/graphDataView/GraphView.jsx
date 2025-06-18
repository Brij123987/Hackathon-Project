import React, { useState } from "react";
import EarthquakeLineChart from "./EarthquakeLineChart";
import CycloneLineChart from "./CycloneLineChart";
import { useLocationContext } from "../userSystem/LocationContext";

const GraphView = ({ location }) => {
  const [activeTab, setActiveTab] = useState("earthquake");
  const { locationData } = useLocationContext();


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