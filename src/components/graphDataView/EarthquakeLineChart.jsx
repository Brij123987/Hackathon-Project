import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale
} from "chart.js";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import "chartjs-adapter-date-fns";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from 'react-leaflet';
import L from 'leaflet';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, TimeScale);

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom earthquake icon based on magnitude
const createEarthquakeIcon = (magnitude) => {
  let color = '#22c55e'; // green for low magnitude
  let size = 20;
  
  if (magnitude >= 7) {
    color = '#ef4444'; // red for high magnitude
    size = 35;
  } else if (magnitude >= 5) {
    color = '#f59e0b'; // orange for medium magnitude
    size = 28;
  } else if (magnitude >= 3) {
    color = '#eab308'; // yellow for moderate magnitude
    size = 24;
  }

  return L.divIcon({
    className: 'custom-earthquake-marker',
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: ${size > 25 ? '12px' : '10px'};
        color: white;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
      ">
        ${magnitude}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2]
  });
};

const EarthquakeLineChart = ({ location }) => {
  const [chartData, setChartData] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const rowsPerPage = 10;

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    setLoading(true);
    setError('');
    axios.get(`${API_BASE_URL}/feature/get_earthquake_data_json/?location=${location}`)
      .then((res) => {
        const sorted = res.data.data.sort((a, b) => new Date(a.DateTime) - new Date(b.DateTime));
        const reversed = [...sorted].reverse();

        const labels = reversed.map(item => item.DateTime);
        const magnitudes = reversed.map(item => item.Magnitude);

        setChartData({
          labels,
          datasets: [
            {
              label: `Earthquake Magnitude in ${location}`,
              data: magnitudes,
              borderColor: "#ef4444",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              fill: true,
              tension: 0.4,
              borderWidth: 3,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: "#ef4444",
              pointBorderColor: "#ffffff",
              pointBorderWidth: 2,
              pointHoverBackgroundColor: "#dc2626",
              pointHoverBorderColor: "#ffffff",
              pointHoverBorderWidth: 3
            }
          ]
        });

        setTableData(reversed);
        setCurrentPage(1);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load earthquake data. Please try again later.");
        setLoading(false);
        console.error(err);
      });
  }, [location, API_BASE_URL]);

  // Calculate map center based on earthquake data
  const mapCenter = useMemo(() => {
    if (tableData.length === 0) return [0, 120];
    
    const avgLat = tableData.reduce((sum, item) => sum + parseFloat(item.Latitude), 0) / tableData.length;
    const avgLng = tableData.reduce((sum, item) => sum + parseFloat(item.Longitude), 0) / tableData.length;
    
    return [avgLat, avgLng];
  }, [tableData]);

  const exportToCSV = () => {
    const headers = ['DateTime', 'Latitude', 'Longitude', 'Magnitude', 'Depth', 'AfterShock Risk'];
    const rows = tableData.map(item => [
      item.DateTime, item.Latitude, item.Longitude, item.Magnitude, item.Depth, item.AfterShock_Risk
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `earthquake_data_${location}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Earthquake Data - ${location}`, 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['DateTime', 'Latitude', 'Longitude', 'Magnitude', 'Depth', 'AfterShock Risk']],
      body: tableData.map(item => [
        item.DateTime, item.Latitude, item.Longitude, item.Magnitude, item.Depth, item.AfterShock_Risk
      ]),
      styles: { fontSize: 8 }
    });
    doc.save(`earthquake_data_${location}.pdf`);
  };

  const totalPages = Math.ceil(tableData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = tableData.slice(startIndex, startIndex + rowsPerPage);

  // Format date for mobile display (shorter format)
  const formatDateForMobile = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

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
      <div className="w-full max-w-full px-0 mx-auto overflow-x-hidden">
        {/* Full Width Chart */}
        <div className="w-full px-2">
          <div className="w-full h-[500px] bg-white rounded-lg shadow-sm p-4">
            {chartData && chartData.labels && chartData.labels.length > 0 ? (
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: {
                    intersect: false,
                    mode: 'index'
                  },
                  plugins: {
                    legend: { 
                      position: "top",
                      labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                          size: 14,
                          weight: 'bold'
                        }
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: '#ffffff',
                      bodyColor: '#ffffff',
                      borderColor: '#ef4444',
                      borderWidth: 1,
                      cornerRadius: 8,
                      displayColors: true,
                      usePointStyle: true
                    }
                  },
                  scales: {
                    x: {
                      type: "time",
                      time: { 
                        unit: "day", 
                        tooltipFormat: "PPP p",
                        displayFormats: {
                          day: 'MMM dd'
                        }
                      },
                      title: { 
                        display: true, 
                        text: "Date & Time",
                        font: {
                          size: 14,
                          weight: 'bold'
                        }
                      },
                      grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        lineWidth: 1
                      },
                      ticks: {
                        font: {
                          size: 12
                        }
                      }
                    },
                    y: {
                      title: { 
                        display: true, 
                        text: "Magnitude (Richter)",
                        font: {
                          size: 14,
                          weight: 'bold'
                        }
                      },
                      grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        lineWidth: 1
                      },
                      ticks: {
                        font: {
                          size: 12
                        }
                      },
                      beginAtZero: false
                    },
                  },
                  elements: {
                    line: {
                      tension: 0.4
                    }
                  }
                }}
              />
            ) : (
              <p className="text-center text-gray-500">Loading chart...</p>
            )}
          </div>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 my-4 px-2 sm:px-4">
        <button onClick={exportToCSV} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm">
          Export CSV
        </button>
        <button onClick={exportToPDF} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm">
          Export PDF
        </button>
      </div>

      {/* Responsive Table - Always Table Format */}
      <div className="w-full px-2 sm:px-4">
        <div className="w-full overflow-x-auto">
          <table className="min-w-full text-xs sm:text-sm border border-gray-300">    
            <thead className="bg-blue-100 font-semibold uppercase">
              <tr>
                {/* Mobile: Show abbreviated headers */}
                <th className="px-1 sm:px-4 py-2 sm:py-3 border text-left">
                  <span className="block sm:hidden">Date</span>
                  <span className="hidden sm:block">Date & Time</span>
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
                  <span className="block sm:hidden">Mag</span>
                  <span className="hidden sm:block">Magnitude</span>
                </th>
                <th className="px-1 sm:px-4 py-2 sm:py-3 border text-left">Depth</th>
                <th className="px-1 sm:px-4 py-2 sm:py-3 border text-left">
                  <span className="block sm:hidden">Risk</span>
                  <span className="hidden sm:block">AfterShock Risk</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-1 sm:px-4 py-2 sm:py-3 border text-xs sm:text-sm">
                    <span className="block sm:hidden">{formatDateForMobile(item.DateTime)}</span>
                    <span className="hidden sm:block">{item.DateTime}</span>
                  </td>
                  <td className="px-1 sm:px-4 py-2 sm:py-3 border text-xs sm:text-sm">
                    {parseFloat(item.Latitude).toFixed(2)}
                  </td>
                  <td className="px-1 sm:px-4 py-2 sm:py-3 border text-xs sm:text-sm">
                    {parseFloat(item.Longitude).toFixed(2)}
                  </td>
                  <td className="px-1 sm:px-4 py-2 sm:py-3 border font-semibold text-red-600 text-xs sm:text-sm">
                    {item.Magnitude}
                  </td>
                  <td className="px-1 sm:px-4 py-2 sm:py-3 border text-xs sm:text-sm">{item.Depth}</td>
                  <td className="px-1 sm:px-4 py-2 sm:py-3 border text-xs sm:text-sm">
                    <span className="block sm:hidden">{item.AfterShock_Risk.substring(0, 3)}</span>
                    <span className="hidden sm:block">{item.AfterShock_Risk}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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

      {/* Interactive Earthquake Map */}
      <div className="w-full px-2 sm:px-4 mt-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              🌍 Earthquake Map View - {location}
            </h2>
            <p className="text-sm opacity-90 mt-1">
              Interactive map showing earthquake locations with magnitude-based markers
            </p>
          </div>
          
          {/* Map Legend */}
          <div className="bg-gray-50 p-3 border-b">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="font-semibold text-gray-700">Legend:</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow"></div>
                <span>Magnitude &lt; 3</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 bg-yellow-500 rounded-full border-2 border-white shadow"></div>
                <span>Magnitude 3-5</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 bg-orange-500 rounded-full border-2 border-white shadow"></div>
                <span>Magnitude 5-7</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-7 h-7 bg-red-500 rounded-full border-2 border-white shadow"></div>
                <span>Magnitude ≥ 7</span>
              </div>
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
                {tableData.map((item, index) => (
                  <Marker 
                    key={index} 
                    position={[parseFloat(item.Latitude), parseFloat(item.Longitude)]}
                    icon={createEarthquakeIcon(parseFloat(item.Magnitude))}
                  >
                    <Popup className="earthquake-popup">
                      <div className="p-2 min-w-[200px]">
                        <div className="font-bold text-red-600 text-lg mb-2 flex items-center gap-2">
                          🌍 Earthquake Details
                        </div>
                        <div className="space-y-1 text-sm">
                          <div><strong>📅 Date:</strong> {new Date(item.DateTime).toLocaleDateString()}</div>
                          <div><strong>⏰ Time:</strong> {new Date(item.DateTime).toLocaleTimeString()}</div>
                          <div><strong>📍 Location:</strong> {parseFloat(item.Latitude).toFixed(3)}°, {parseFloat(item.Longitude).toFixed(3)}°</div>
                          <div><strong>📊 Magnitude:</strong> <span className="text-red-600 font-bold">{item.Magnitude}</span></div>
                          <div><strong>🕳️ Depth:</strong> {item.Depth} km</div>
                          <div><strong>⚠️ Aftershock Risk:</strong> 
                            <span className={`ml-1 px-2 py-1 rounded text-xs font-semibold ${
                              item.AfterShock_Risk === 'High' ? 'bg-red-100 text-red-800' :
                              item.AfterShock_Risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {item.AfterShock_Risk}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">🗺️</div>
                  <p>No earthquake data available to display on map</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Map Footer */}
          <div className="bg-gray-50 p-3 text-xs text-gray-600 text-center">
            Showing {tableData.length} earthquake{tableData.length !== 1 ? 's' : ''} • Click markers for detailed information
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarthquakeLineChart;