import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function UserLogin() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        rememberMe: false,
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const response = await axios.post("http://127.0.0.1:8000/user/login/", {
                username: formData.username,
                password: formData.password,
            });

            const token = response.data.access_token; // Adjust this if your backend returns something else

            if (formData.rememberMe) {
                localStorage.setItem("authToken", token);
            } else {
                sessionStorage.setItem("authToken", token);
            }

            setMessage("✅ Logged in successfully!");

            // ✅ Redirect to home/dashboard/profile after login
            navigate("/"); // Update path as per your routing

        } catch (error) {
            console.error("Login error:", error);
            setMessage("❌ Invalid credentials or server error.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-md mx-auto">
            <h2 className="text-xl font-bold">Login</h2>

            <input
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full border p-2"
            />

            <input
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full border p-2"
            />

            <label className="flex items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                />
                Remember Me
            </label>

            <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded"
            >
                {loading ? "Logging in..." : "Login"}
            </button>

            {message && <p className="mt-2">{message}</p>}
        </form>
    );
}


export default UserLogin;