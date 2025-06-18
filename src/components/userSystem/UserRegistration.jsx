import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLocationContext } from "./LocationContext";

function UserRegistration() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirm_password: ""
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const { setLocationData } = useLocationContext();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const getCityFromCoords = async (lat, lon) => {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
        );
        const data = await res.json();
        const address = data.address;
        return address.city || address.town || address.village || address.state || "Unknown";
    };

    const getCityFromIP = async () => {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        return data.city || data.region || "Unknown";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        let locationData = {
            city: "Unknown",
        };

        try {
            // Try to get city from geolocation or fallback to IP
            await new Promise((resolve) => {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        const city = await getCityFromCoords(latitude, longitude);
                        locationData = { lat: latitude, lon: longitude, city };
                        resolve();
                    },
                    async () => {
                        const city = await getCityFromIP();
                        locationData = { city, fallback: true };
                        resolve();
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            });

            const fullData = {
                ...formData,
                // Uncomment if you want to send location:
                // location: locationData,
            };

            const response = await axios.post("http://127.0.0.1:8000/user/register/", fullData);
            console.log(response);
            setMessage("✅ Registered successfully!");
            setLocationData(locationData);
            navigate("/login");

        } catch (err) {
            if (err.response && err.response.data) {
                const errors = err.response.data;
                const errorMessages = Object.entries(errors)
                    .map(([field, messages]) => `${messages.join(", ")}`)
                    .join("\n");

                setMessage(`❌ ${errorMessages}`);
            } else {
                setMessage("❌ Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-md mx-auto">
            <h2 className="text-xl font-bold">Register</h2>

            <input
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full border p-2"
            />

            <input
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border p-2"
            />

            <input
                name="password"
                placeholder="Password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full border p-2"
            />

            <input
                name="confirm_password"
                placeholder="Confirm Password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
                className="w-full border p-2"
            />

            <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded"
            >
                {loading ? "Registering..." : "Register"}
            </button>

            {message && <p className="mt-2 whitespace-pre-line text-red-600">{message}</p>}
        </form>
    );
}

export default UserRegistration;
