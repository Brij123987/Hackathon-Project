import React, { useEffect, useState } from 'react';
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, TimeScale);

const EarthquakeLineChart = ({ location }) => {
  const [chartData, setChartData] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const rowsPerPage = 10;

  useEffect(() => {
    setLoading(true);
    setError('');
    axios.get(`http://127.0.0.1:8000/feature/get_earthquake_data_json/?location=${location}`)
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
  }, [location]);

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
    </div>
  );
};

export default EarthquakeLineChart;