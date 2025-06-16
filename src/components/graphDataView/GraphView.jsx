import React, { useState } from "react";
import EarthquakeLineChart from "./EarthquakeLineChart";


const GraphView = ({ location }) => {
    const [activeTab, setActiveTab] = useState("earthquake");

    return (
        <div className="w-full min-h-screen bg-gray-50 p-6">
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold mb-2">📊 Disaster Graphs for {location}</h2>
                <div className="flex justify-center gap-4 mt-4">
                    <button
                        onClick={() => setActiveTab("earthquake")}
                        className={`px-4 py-2 rounded-md ${
                            activeTab === "cyclone" ? "bg-blue-600 text-white" : "bg-gray-200"
                        }`}
                    >
                        Cyclone
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-md">
                {activeTab === "earthquake" ? (
                    <EarthquakeLineChart location = {"japan"} />
                ) : (
                    <CycloneLineChart location = {location} />
                )}

            </div>
        </div>
    );
};


export default GraphView;
