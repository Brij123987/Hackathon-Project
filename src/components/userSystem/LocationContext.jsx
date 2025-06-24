import React, { createContext, useState, useContext, useEffect, useCallback } from "react";

// Create Context
const LocationContext = createContext();

// Export Provider
export const LocationProvider = ({ children }) => {
    const [locationData, setLocationData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

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

    const getCurrentLocation = useCallback(async (forceRefresh = false) => {
        // If we already have location data and not forcing refresh, return it
        if (locationData && !forceRefresh) {
            return locationData;
        }

        setIsLoading(true);
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                // Fallback to IP-based location
                getCityFromIP().then(city => {
                    const newLocationData = { city, fallback: true, timestamp: Date.now() };
                    setLocationData(newLocationData);
                    localStorage.setItem('userLocation', JSON.stringify(newLocationData));
                    setIsLoading(false);
                    resolve(newLocationData);
                });
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const city = await getCityFromCoords(latitude, longitude);
                        const newLocationData = { 
                            lat: latitude, 
                            lon: longitude, 
                            city,
                            timestamp: Date.now(),
                            source: 'gps'
                        };
                        setLocationData(newLocationData);
                        localStorage.setItem('userLocation', JSON.stringify(newLocationData));
                        setIsLoading(false);
                        resolve(newLocationData);
                    } catch (error) {
                        console.error('Error processing geolocation:', error);
                        // Fallback to IP
                        const city = await getCityFromIP();
                        const newLocationData = { 
                            city, 
                            fallback: true, 
                            timestamp: Date.now(),
                            source: 'ip'
                        };
                        setLocationData(newLocationData);
                        localStorage.setItem('userLocation', JSON.stringify(newLocationData));
                        setIsLoading(false);
                        resolve(newLocationData);
                    }
                },
                async () => {
                    // Geolocation failed, use IP fallback
                    try {
                        const city = await getCityFromIP();
                        const newLocationData = { 
                            city, 
                            fallback: true, 
                            timestamp: Date.now(),
                            source: 'ip_fallback'
                        };
                        setLocationData(newLocationData);
                        localStorage.setItem('userLocation', JSON.stringify(newLocationData));
                        setIsLoading(false);
                        resolve(newLocationData);
                    } catch (error) {
                        console.error('All location methods failed:', error);
                        const newLocationData = { 
                            city: "Unknown", 
                            fallback: true, 
                            timestamp: Date.now(),
                            source: 'failed'
                        };
                        setLocationData(newLocationData);
                        setIsLoading(false);
                        resolve(newLocationData);
                    }
                },
                { 
                    enableHighAccuracy: true, 
                    timeout: 10000, // Increased timeout for better accuracy
                    maximumAge: 300000 // 5 minutes cache
                }
            );
        });
    }, [getCityFromCoords, getCityFromIP, locationData]);

    // Initialize location data on mount
    useEffect(() => {
        const initializeLocation = async () => {
            try {
                // Check if location data exists in localStorage
                const savedLocation = localStorage.getItem('userLocation');
                if (savedLocation) {
                    const parsedLocation = JSON.parse(savedLocation);
                    
                    // Check if location data is recent (less than 24 hours old)
                    const isRecent = parsedLocation.timestamp && 
                        (Date.now() - parsedLocation.timestamp) < 24 * 60 * 60 * 1000;
                    
                    if (isRecent) {
                        setLocationData(parsedLocation);
                        console.log('✅ Using cached location:', parsedLocation.city);
                    } else {
                        console.log('📍 Location data is stale, will refresh when needed');
                        // Don't automatically refresh, let components request it when needed
                        setLocationData(parsedLocation); // Still use stale data as fallback
                    }
                } else {
                    console.log('📍 No saved location found');
                }
            } catch (error) {
                console.error('Error initializing location:', error);
            }
        };

        initializeLocation();
    }, []); // Empty dependency array - only run once on mount

    const updateLocationData = useCallback((newLocationData) => {
        const dataWithTimestamp = {
            ...newLocationData,
            timestamp: Date.now()
        };
        setLocationData(dataWithTimestamp);
        localStorage.setItem('userLocation', JSON.stringify(dataWithTimestamp));
    }, []);

    const clearLocationData = useCallback(() => {
        setLocationData(null);
        localStorage.removeItem('userLocation');
    }, []);

    // Check if location data needs refresh (older than 24 hours)
    const isLocationStale = useCallback(() => {
        if (!locationData || !locationData.timestamp) return true;
        return (Date.now() - locationData.timestamp) > 24 * 60 * 60 * 1000;
    }, [locationData]);

    return (
        <LocationContext.Provider value={{ 
            locationData, 
            setLocationData: updateLocationData, 
            isLoading,
            getCurrentLocation,
            clearLocationData,
            isLocationStale
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