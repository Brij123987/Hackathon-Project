import React, { createContext, useState, useContext, useEffect, useCallback } from "react";

// Create Context
const LocationContext = createContext();

// Export Provider
export const LocationProvider = ({ children }) => {
    const [locationData, setLocationData] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // Changed to false initially

    const getCityFromCoords = useCallback(async (lat, lon) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
            );
            const data = await res.json();
            const address = data.address;
            return address.city || address.town || address.village || address.state || "Unknown";
        } catch (error) {
            console.error('Error getting city from coordinates:', error);
            return "Unknown";
        }
    }, []);

    const getCityFromIP = useCallback(async () => {
        try {
            const res = await fetch("https://ipapi.co/json/");
            const data = await res.json();
            return data.city || data.region || "Unknown";
        } catch (error) {
            console.error('Error getting city from IP:', error);
            return "Unknown";
        }
    }, []);

    const getCurrentLocation = useCallback(async () => {
        setIsLoading(true);
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                // Fallback to IP-based location
                getCityFromIP().then(city => {
                    const locationData = { city, fallback: true };
                    setLocationData(locationData);
                    localStorage.setItem('userLocation', JSON.stringify(locationData));
                    setIsLoading(false);
                    resolve(locationData);
                });
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const city = await getCityFromCoords(latitude, longitude);
                        const locationData = { lat: latitude, lon: longitude, city };
                        setLocationData(locationData);
                        localStorage.setItem('userLocation', JSON.stringify(locationData));
                        setIsLoading(false);
                        resolve(locationData);
                    } catch (error) {
                        console.error('Error processing geolocation:', error);
                        // Fallback to IP
                        const city = await getCityFromIP();
                        const locationData = { city, fallback: true };
                        setLocationData(locationData);
                        localStorage.setItem('userLocation', JSON.stringify(locationData));
                        setIsLoading(false);
                        resolve(locationData);
                    }
                },
                async () => {
                    // Geolocation failed, use IP fallback
                    try {
                        const city = await getCityFromIP();
                        const locationData = { city, fallback: true };
                        setLocationData(locationData);
                        localStorage.setItem('userLocation', JSON.stringify(locationData));
                        setIsLoading(false);
                        resolve(locationData);
                    } catch (error) {
                        console.error('All location methods failed:', error);
                        const locationData = { city: "Unknown", fallback: true };
                        setLocationData(locationData);
                        setIsLoading(false);
                        resolve(locationData);
                    }
                },
                { 
                    enableHighAccuracy: false, 
                    timeout: 5000, 
                    maximumAge: 300000 // 5 minutes cache
                }
            );
        });
    }, [getCityFromCoords, getCityFromIP]);

    // Initialize location data on mount - only check saved location, don't request new one
    useEffect(() => {
        const initializeLocation = async () => {
            try {
                // Check if location data exists in localStorage
                const savedLocation = localStorage.getItem('userLocation');
                if (savedLocation) {
                    const parsedLocation = JSON.parse(savedLocation);
                    setLocationData(parsedLocation);
                }
                // Don't automatically request location on mount
            } catch (error) {
                console.error('Error initializing location:', error);
            }
        };

        initializeLocation();
    }, []); // Empty dependency array - only run once on mount

    const updateLocationData = useCallback((newLocationData) => {
        setLocationData(newLocationData);
        localStorage.setItem('userLocation', JSON.stringify(newLocationData));
    }, []);

    return (
        <LocationContext.Provider value={{ 
            locationData, 
            setLocationData: updateLocationData, 
            isLoading,
            getCurrentLocation 
        }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocationContext = () => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocationContext must be used within a LocationProvider');
    }
    return context;
};