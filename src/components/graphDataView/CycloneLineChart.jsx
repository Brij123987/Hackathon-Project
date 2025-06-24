import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "chartjs-adapter-date-fns";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle
} from 'react-leaflet';
import L from 'leaflet';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale
);

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom cyclone icon based on wind speed
const createCycloneIcon = (windSpeed) => {
  let color = '#22c55e'; // green for low wind speed
  let size = 20;
  let intensity = 'Low';

  if (windSpeed >= 120) {
    color = '#dc2626'; // red for very high wind speed
    size = 40;
    intensity = 'Extreme';
  } else if (windSpeed >= 90) {
    color = '#ea580c'; // orange-red for high wind speed
    size = 35;
    intensity = 'High';
  } else if (windSpeed >= 60) {
    color = '#f59e0b'; // orange for moderate-high wind speed
    size = 30;
    intensity = 'Moderate';
  } else if (windSpeed >= 30) {
    color = '#eab308'; // yellow for moderate wind speed
    size = 25;
    intensity = 'Low';
  }

  return L.divIcon({
    className: 'custom-cyclone-marker',
    html: `
      <div style="
        background: radial-gradient(circle, ${color}, ${color}aa);
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: ${size > 30 ? '10px' : '8px'};
        color: white;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        animation: cyclone-spin 3s linear infinite;
        position: relative;
      ">
        🌪️
        <div style="
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          white-space: nowrap;
        ">
          ${Math.round(windSpeed)} km/h
        </div>
      </div>
    `,
    iconSize: [size, size + 20],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

// Wind speed circle component for animation effect
const WindSpeedCircle = ({ center, windSpeed, windPressure, date }) => {
  const radius = Math.max(windSpeed * 100, 1000); // Scale radius based on wind speed
  const color = windSpeed >= 120 ? '#dc2626' :
    windSpeed >= 90 ? '#ea580c' :
      windSpeed >= 60 ? '#f59e0b' :
        windSpeed >= 30 ? '#eab308' : '#22c55e';

  return (
    <Circle
      center={center}
      radius={radius}
      pathOptions={{
        color: color,
        fillColor: color,
        fillOpacity: 0.1,
        weight: 2,
        opacity: 0.6,
        className: 'wind-speed-circle'
      }}
    />
  );
};

const CycloneLineChart = ({ location }) => {
  const [chartData, setChartData] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [animationIndex, setAnimationIndex] = useState(0);
  const today = useMemo(() => new Date().toISOString().split("T")[0], [])
  const rowsPerPage = 10;

  const [currentDateSpeed, setCurrentDateSpeed] = useState(0);
  const [currentDatePressure, setCurrentDatePressure] = useState(0);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Memoize the API call to prevent unnecessary re-renders

  const fetchWindSpeedCurrent = useCallback(async () => {
    if (!location || !API_BASE_URL) return;

    setLoading(true);
    setError("");

    try {
      const res = await axios.get(
        `${API_BASE_URL}/feature/get_cyclone_data/?location=${location}&end_date=${today}`,
        { timeout: 10000 }
      );

      const currentPressure = res.data.data.cyclone_data.main.pressure;
      const currentSpeed = res.data.data.cyclone_data.wind.speed;

      setCurrentDatePressure(currentPressure);
      setCurrentDateSpeed(currentSpeed);

    } catch (error) {
      console.log("Failed to fetch cyclone data: ", error);
      setError("Failed to load cyclone data. Please try again later.");
    } finally {
      setLoading(false);
    }

  }, [location, today, API_BASE_URL]);

  useEffect(() => {
    fetchWindSpeedCurrent();
  }, [fetchWindSpeedCurrent]);

  const fetchCycloneData = useCallback(async () => {
    if (!location || !API_BASE_URL) return;

    setLoading(true);
    setError("");

    try {
      const res = await axios.get(
        `${API_BASE_URL}/feature/get_cyclone_data_json/?location=${location}`,
        { timeout: 15000 }
      );

      const sorted = res.data.data.sort((a, b) => new Date(a.Date) - new Date(b.Date));
      const reversed = [...sorted].reverse();

      const labels = sorted.map(item => new Date(item.Date).toISOString());
      const windSpeeds = sorted.map((item) => item.windSpeed);
      const windPressures = sorted.map((item) => item.windPressure);

      setChartData({
        labels,
        datasets: [
          {
            label: `Wind Speed (km/h) in ${location}`,
            data: windSpeeds,
            borderColor: "#10b981",
            backgroundColor: "#10b981",
            tension: 0.4,
            yAxisID: "y1",
          },
          {
            label: `Wind Pressure (hPa)`,
            data: windPressures,
            borderColor: "#3b82f6",
            backgroundColor: "#3b82f6",
            tension: 0.4,
            yAxisID: "y2",
          },
        ],
      });

      setTableData(reversed);
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to fetch cyclone data:", error);
      setError("Failed to load cyclone data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [location, API_BASE_URL]);

  useEffect(() => {
    console.log("Updated chartData:", chartData);
  }, [chartData]);

  useEffect(() => {
    fetchCycloneData();
  }, [fetchCycloneData]);


  // Animation effect for cycling through data points
  useEffect(() => {
    if (tableData.length === 0) return;

    const interval = setInterval(() => {
      setAnimationIndex((prev) => (prev + 1) % tableData.length);
    }, 2000); // Change every 2 seconds

    return () => clearInterval(interval);
  }, [tableData.length]);

  // Calculate map center based on cyclone data
  const mapCenter = useMemo(() => {
    if (tableData.length === 0) return [0, 120];

    const avgLat = tableData.reduce((sum, item) => sum + parseFloat(item.Latitude), 0) / tableData.length;
    const avgLng = tableData.reduce((sum, item) => sum + parseFloat(item.Longitude), 0) / tableData.length;

    return [avgLat, avgLng];
  }, [tableData]);

  const totalPages = useMemo(() => Math.ceil(tableData.length / rowsPerPage), [tableData.length]);
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return tableData.slice(startIndex, startIndex + rowsPerPage);
  }, [tableData, currentPage]);

  // Format date for mobile display (shorter format)
  const formatDateForMobile = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  const exportToCSV = useCallback(() => {
    const headers = ["Date", "Latitude", "Longitude", "Wind Pressure", "Wind Speed"];
    const rows = tableData.map(item => [
      item.Date, item.Latitude, item.Longitude, item.windPressure, item.windSpeed
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cyclone_data_${location}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [tableData, location]);

  const exportToPDF = useCallback(() => {
    const doc = new jsPDF();
    doc.text(`Cyclone Data - ${location}`, 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [["Date", "Latitude", "Longitude", "Wind Pressure", "Wind Speed"]],
      body: tableData.map(item => [
        item.Date, item.Latitude, item.Longitude, item.windPressure, item.windSpeed
      ]),
      styles: { fontSize: 8 }
    });
    doc.save(`cyclone_data_${location}.pdf`);
  }, [tableData, location]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 font-semibold">{error}</div>
    );
  }

  return (
    <div>
      <div className="w-full px-2">
        <div className="w-full h-[500px]">
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: "top" },
              },
              scales: {
                x: {
                  type: "time",
                  time: { unit: "day", tooltipFormat: "PPP" },
                  title: { display: true, text: "Date" },
                },
                y1: {
                  position: "left",
                  title: { display: true, text: "Wind Speed (km/h)" },
                },
                y2: {
                  position: "right",
                  title: { display: true, text: "Wind Pressure (hPa)" },
                  grid: { drawOnChartArea: false },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 my-4 px-2 sm:px-4">
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
        >
          Export CSV
        </button>
        <button
          onClick={exportToPDF}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          Export PDF
        </button>
      </div>

      {/* Responsive Table - Always Table Format */}
      <div className="w-full px-2 sm:px-4">
        <div className="w-full overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-xs sm:text-sm text-left">
            <thead className="bg-blue-100 font-semibold uppercase">
              <tr>
                {/* Mobile: Show abbreviated headers */}
                <th className="px-1 sm:px-4 py-2 sm:py-3 border text-left">
                  <span className="block sm:hidden">Date</span>
                  <span className="hidden sm:block">Date</span>
                </th>
                <th className="px-1 sm:px-4 py-2 sm:py-3 border text-left">
                  <span className="block sm:hidden">Lat</span>
                  <span className="hidden sm:block">Latitude</span>
                </th>
                <th className="px-1 sm:px-4 py-2 sm:py-3 border text-left">
                  <span className="block sm:hidden">Lng</span>
                  <span className="hidden sm:block">Longitude</span>
                </th>
                <th className="px-1 sm:px-4 py-2 sm:py-3 border text-left">
                  <span className="block sm:hidden">Pressure</span>
                  <span className="hidden sm:block">Wind Pressure</span>
                </th>
                <th className="px-1 sm:px-4 py-2 sm:py-3 border text-left">
                  <span className="block sm:hidden">Speed</span>
                  <span className="hidden sm:block">Wind Speed</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-1 sm:px-4 py-2 sm:py-3 border text-xs sm:text-sm">
                    <span className="block sm:hidden">{formatDateForMobile(item.Date)}</span>
                    <span className="hidden sm:block">{item.Date}</span>
                  </td>
                  <td className="px-1 sm:px-4 py-2 sm:py-3 border text-xs sm:text-sm">
                    {parseFloat(item.Latitude).toFixed(2)}
                  </td>
                  <td className="px-1 sm:px-4 py-2 sm:py-3 border text-xs sm:text-sm">
                    {parseFloat(item.Longitude).toFixed(2)}
                  </td>
                  <td className="px-1 sm:px-4 py-2 sm:py-3 border font-semibold text-blue-600 text-xs sm:text-sm">
                    {item.windPressure}
                  </td>
                  <td className="px-1 sm:px-4 py-2 sm:py-3 border font-semibold text-green-600 text-xs sm:text-sm">
                    {item.windSpeed}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center items-center mt-6 gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50 text-sm"
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50 text-sm"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Cyclone Map */}
      <div className="w-full px-2 sm:px-4 mt-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              🌪️ Cyclone Wind Speed Map - {location}
            </h2>
            <p className="text-sm opacity-90 mt-1">
              Interactive map showing cyclone paths with animated wind speed visualization
            </p>
          </div>

          {/* Map Legend */}
          <div className="bg-gray-50 p-3 border-b">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="font-semibold text-gray-700">Wind Speed Legend:</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow"></div>
                <span>30 km/h</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 bg-yellow-500 rounded-full border-2 border-white shadow"></div>
                <span>30-60 km/h</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 bg-orange-500 rounded-full border-2 border-white shadow"></div>
                <span>60-90 km/h</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-7 h-7 bg-orange-600 rounded-full border-2 border-white shadow"></div>
                <span>90-120 km/h</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-8 h-8 bg-red-600 rounded-full border-2 border-white shadow"></div>
                <span>≥ 120 km/h</span>
              </div>
            </div>
          </div>

          {/* Animation Controls */}
          <div className="bg-gray-50 p-3 border-b flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Current Animation:</span>
              {tableData[animationIndex] ? (
                <span className="ml-2">
                  {new Date(tableData[animationIndex].Date).toLocaleDateString()} -
                  Wind Speed: {tableData[animationIndex].windSpeed} km/h
                </span>
              ) : (
                <span className="ml-2">Loading...</span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              Auto-cycling through {tableData.length} data points
            </div>
          </div>

          <div className="h-[500px] w-full relative">
            {tableData.length > 0 ? (
              <MapContainer
                center={mapCenter}
                zoom={6}
                scrollWheelZoom={true}
                className="h-full w-full z-0"
                style={{ zIndex: 0 }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Show all cyclone points with reduced opacity */}
                {tableData.map((item, index) => (
                  <React.Fragment key={index}>
                    <Marker
                      position={[parseFloat(item.Latitude), parseFloat(item.Longitude)]}
                      icon={createCycloneIcon(parseFloat(currentDateSpeed))}
                      opacity={index === animationIndex ? 1 : 0.3}
                    >
                      <Popup className="cyclone-popup">
                        <div className="p-2 min-w-[200px]">
                          <div className="font-bold text-blue-600 text-lg mb-2 flex items-center gap-2">
                            🌪️ Cyclone Details
                          </div>
                          <div className="space-y-1 text-sm">
                            <div><strong>📅 Date:</strong> {new Date(item.Date).toLocaleDateString()}</div>
                            <div><strong>⏰ Time:</strong> {new Date(item.Date).toLocaleTimeString()}</div>
                            <div><strong>📍 Location:</strong> {parseFloat(item.Latitude).toFixed(3)}°, {parseFloat(item.Longitude).toFixed(3)}°</div>
                            <div><strong>💨 Wind Speed:</strong> <span className="text-green-600 font-bold">{currentDateSpeed} km/h</span></div>
                            <div><strong>🌡️ Pressure:</strong> {currentDatePressure} hPa</div>
                            <div><strong>⚡ Intensity:</strong>
                              <span className={`ml-1 px-2 py-1 rounded text-xs font-semibold ${currentDateSpeed >= 120 ? 'bg-red-100 text-red-800' :
                                  item.windSpeed >= 90 ? 'bg-orange-100 text-orange-800' :
                                    item.windSpeed >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-green-100 text-green-800'
                                }`}>
                                {currentDateSpeed >= 120 ? 'Extreme' :
                                  currentDateSpeed >= 90 ? 'High' :
                                  currentDateSpeed >= 60 ? 'Moderate' : 'Low'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>

                    {/* Wind speed circles for visual effect */}
                    <WindSpeedCircle
                      center={[parseFloat(item.Latitude), parseFloat(item.Longitude)]}
                      windSpeed={parseFloat(currentDateSpeed)}
                      windPressure={parseFloat(currentDatePressure)}
                      date={item.Date}
                    />
                  </React.Fragment>
                ))}
              </MapContainer>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">🗺️</div>
                  <p>No cyclone data available to display on map</p>
                </div>
              </div>
            )}
          </div>

          {/* Map Footer */}
          <div className="bg-gray-50 p-3 text-xs text-gray-600 text-center">
            Showing {tableData.length} cyclone data point{tableData.length !== 1 ? 's' : ''} •
            Click markers for detailed information • Circles represent wind impact zones
          </div>
        </div>
      </div>

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes cyclone-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .custom-cyclone-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .cyclone-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .cyclone-popup .leaflet-popup-content {
          margin: 0;
          padding: 0;
        }
        
        .cyclone-popup .leaflet-popup-tip {
          background: white;
        }
        
        .wind-speed-circle {
          animation: wind-pulse 3s ease-in-out infinite;
        }
        
        @keyframes wind-pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default CycloneLineChart;