import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    setLoading(true);
    setError("");

    axios
      .get(`http://127.0.0.1:8000/feature/get_cyclone_data_json/?location=${location}`)
      .then((res) => {
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
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch cyclone data:", error);
        setError("Failed to load cyclone data. Please try again later.");
        setLoading(false);
      });
  }, [location]);

  const totalPages = Math.ceil(tableData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = tableData.slice(startIndex, startIndex + rowsPerPage);

  const exportToCSV = () => {
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
  };

  const exportToPDF = () => {
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
      <Line
        data={chartData}
        options={{
          responsive: true,
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

      <div className="flex justify-end gap-4 my-4">
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Export CSV
        </button>
        <button
          onClick={exportToPDF}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Export PDF
        </button>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="min-w-full border border-gray-300 text-sm text-left">
          <thead className="bg-blue-100 text-xs font-semibold uppercase">
            <tr>
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Latitude</th>
              <th className="px-4 py-2 border">Longitude</th>
              <th className="px-4 py-2 border">Wind Pressure</th>
              <th className="px-4 py-2 border">Wind Speed</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{item.Date}</td>
                <td className="px-4 py-2 border">{item.Latitude}</td>
                <td className="px-4 py-2 border">{item.Longitude}</td>
                <td className="px-4 py-2 border font-semibold">{item.windPressure}</td>
                <td className="px-4 py-2 border font-semibold">{item.windSpeed}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-center items-center mt-4 gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="px-3 py-1">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CycloneLineChart;
