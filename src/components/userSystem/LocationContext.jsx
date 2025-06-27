import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect
} from 'react';

export const LocationContext = createContext();

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

    const getCurrentLocation = useCallback(async (forceRefresh = false) => {
        if (locationData && !forceRefresh) {
            return locationData;
        }

        setIsLoading(true);
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                console.error('Geolocation not supported');
                const fallbackLocation = {
                    city: "Unknown",
                    fallback: true,
                    timestamp: Date.now(),
                    source: 'not_supported'
                };
                setLocationData(fallbackLocation);
                localStorage.setItem('userLocation', JSON.stringify(fallbackLocation));
                setIsLoading(false);
                resolve(fallbackLocation);
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
                        const fallbackLocation = {
                            city: "Unknown",
                            fallback: true,
                            timestamp: Date.now(),
                            source: 'gps_error'
                        };
                        setLocationData(fallbackLocation);
                        localStorage.setItem('userLocation', JSON.stringify(fallbackLocation));
                        setIsLoading(false);
                        resolve(fallbackLocation);
                    }
                },
                (error) => {
                    console.error('Geolocation failed:', error);
                    const fallbackLocation = {
                        city: "Unknown",
                        fallback: true,
                        timestamp: Date.now(),
                        source: 'gps_failed'
                    };
                    setLocationData(fallbackLocation);
                    localStorage.setItem('userLocation', JSON.stringify(fallbackLocation));
                    setIsLoading(false);
                    resolve(fallbackLocation);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000
                }
            );
        });
    }, [getCityFromCoords, locationData]);

    useEffect(() => {
        const initializeLocation = async () => {
            try {
                const savedLocation = localStorage.getItem('userLocation');
                if (savedLocation) {
                    const parsedLocation = JSON.parse(savedLocation);
                    const isRecent = parsedLocation.timestamp &&
                        (Date.now() - parsedLocation.timestamp) < 24 * 60 * 60 * 1000;
                    if (isRecent) {
                        setLocationData(parsedLocation);
                        console.log('✅ Using cached location:', parsedLocation.city);
                    } else {
                        console.log('📍 Location data is stale, will refresh when needed');
                        setLocationData(parsedLocation);
                    }
                } else {
                    console.log('📍 No saved location found');
                }
            } catch (error) {
                console.error('Error initializing location:', error);
            }
        };

        initializeLocation();
    }, []);

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
