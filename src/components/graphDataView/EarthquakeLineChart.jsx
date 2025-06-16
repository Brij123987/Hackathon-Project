import React, { useEffect,useState } from 'react';
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


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, TimeScale)

const EarthquakeLineChart = ({location}) => {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/feature/get_earthquake_data_json/?location=${location}`)
        .then((res) => res.json())
        .then((json) => {
            const sorted = json.data.sort(
                (a, b) => new Date(a.DateTime) - new Date(b.DateTime)
            );

            const labels =  sorted.map(item => item.DateTime);
            const magnitudes = sorted.map(item => item.Magnitude);

            setChartData({
                labels,
                datasets: [
                    {
                        label: `Earthquake Magnitude in ${location}`,
                        data: magnitudes,
                        borderColor: "#ef4444", //red
                        backgroundColor: "#ef4444",
                        fill: false,
                        tension: 0.4
                    }
                ]
            });
        });
    }, [location]);

    if (!chartData) return <p className='text-center text-gray-500'>Loading.........</p>;


    return (
        <Line
            data = {chartData}
            options={{
                responsive: true,
                plugins: {
                    legend: {
                        position: "top"}
                },
                scales: {
                    x: {
                        type: "time",
                        time: {unit:"day", tooltipFormat: "PPP p"},
                        title: {display:true, text: "Date & Time"}
                    },
                    y: {
                        title: {display: true, text: "Magnitude (Richter)"}
                    }
                }

            }}
        />
    );
};

export default EarthquakeLineChart;
