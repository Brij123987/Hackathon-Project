import React, { useEffect, useState } from 'react';
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
import "chartjs-adapter-date-fns";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, TimeScale);

const EarthquakeLineChart = ({ location }) => {
  const [chartData, setChartData] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/feature/get_earthquake_data_json/?location=${location}`)
      .then((res) => res.json())
      .then((json) => {
        const sorted = json.data.sort((a, b) => new Date(a.DateTime) - new Date(b.DateTime));
        const reversed = [...sorted].reverse(); // latest first

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
        setCurrentPage(1); // reset to first page when location changes
      });
  }, [location]);

  if (!chartData) return <p className='text-center text-gray-500'>Loading.........</p>;

  const totalPages = Math.ceil(tableData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = tableData.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="p-4">
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: "top" }
          },
          scales: {
            x: {
              type: "time",
              time: { unit: "day", tooltipFormat: "PPP p" },
              title: { display: true, text: "Date & Time" }
            },
            y: {
              title: { display: true, text: "Magnitude (Richter)" }
            }
          }
        }}
      />

      <div className="overflow-x-auto mt-6">
        <table className="min-w-full text-sm text-left border border-gray-300">
          <thead className="bg-blue-100 text-xs font-semibold uppercase">
            <tr>
              <th className="px-4 py-2 border">Date & Time</th>
              <th className="px-4 py-2 border">Latitude</th>
              <th className="px-4 py-2 border">Longitude</th>
              <th className="px-4 py-2 border">Magnitude</th>
              <th className="px-4 py-2 border">Depth</th>
              <th className="px-4 py-2 border">AfterShock RisK</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{item.DateTime}</td>
                <td className="px-4 py-2 border">{item.Latitude}</td>
                <td className="px-4 py-2 border">{item.Longitude}</td>
                <td className="px-4 py-2 border font-semibold">{item.Magnitude}</td>
                <td className="px-4 py-2 border">{item.Depth}</td>
                <td className="px-4 py-2 border">{item.AfterShock_Risk}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center mt-4 gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="px-3 py-1">{currentPage} / {totalPages}</span>
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

export default EarthquakeLineChart;
