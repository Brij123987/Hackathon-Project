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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale
);

const CycloneLineChart = ({ location }) => {
  const [chartData, setChartData] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const rowsPerPage = 10;

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Memoize the API call to prevent unnecessary re-renders
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

      const labels = sorted.map((item) => item.Date);
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
    fetchCycloneData();
  }, [fetchCycloneData]);

  const totalPages = useMemo(() => Math.ceil(tableData.length / rowsPerPage), [tableData.length]);
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return tableData.slice(startIndex, startIndex + rowsPerPage);
  }, [tableData, currentPage]);

  // Format date for mobile display (shorter format)
  const formatDateForMobile = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
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
    </div>
  );
};

export default CycloneLineChart;