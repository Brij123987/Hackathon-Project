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
              backgroundColor: "#ef4444",
              fill: false,
              tension: 0.8
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

  return (
    <div>
      <div className="w-full max-w-full px-0 mx-auto overflow-x-hidden">
        {/* Full Width Chart */}
        <div className="w-full px-2">
          <div className="w-full h-[500px]">
            {chartData && chartData.labels && chartData.labels.length > 0 ? (
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
                      time: { unit: "day", tooltipFormat: "PPP p" },
                      title: { display: true, text: "Date & Time" },
                    },
                    y: {
                      title: { display: true, text: "Magnitude (Richter)" },
                    },
                  },
                }}
              />
            ) : (
              <p className="text-center text-gray-500">Loading chart...</p>
            )}
          </div>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex justify-end gap-4 my-4 px-2 sm:px-4">
        <button onClick={exportToCSV} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          Export CSV
        </button>
        <button onClick={exportToPDF} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
          Export PDF
        </button>
      </div>

      {/* Table */}
      <div className="w-full max-w-full">
        <div className="w-full overflow-x-auto px-2"> 
          <table className="w-full text-xs sm:text-sm border border-gray-300">    
            <thead className="bg-blue-100 font-semibold uppercase">
              <tr>
                <th className="px-2 py-2 border whitespace-nowrap">Date & Time</th>
                <th className="px-2 py-2 border whitespace-nowrap">Latitude</th>
                <th className="px-2 py-2 border whitespace-nowrap">Longitude</th>
                <th className="px-2 py-2 border whitespace-nowrap">Magnitude</th>
                <th className="px-2 py-2 border whitespace-nowrap">Depth</th>
                <th className="px-2 py-2 border whitespace-nowrap">AfterShock Risk</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-2 py-2 border whitespace-nowrap">{item.DateTime}</td>
                  <td className="px-2 py-2 border">{item.Latitude}</td>
                  <td className="px-2 py-2 border">{item.Longitude}</td>
                  <td className="px-2 py-2 border font-semibold">{item.Magnitude}</td>
                  <td className="px-2 py-2 border">{item.Depth}</td>
                  <td className="px-2 py-2 border">{item.AfterShock_Risk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
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

  );
};

export default EarthquakeLineChart;
