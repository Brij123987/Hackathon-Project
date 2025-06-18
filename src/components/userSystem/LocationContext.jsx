import React, { createContext, useState, useContext } from "react";


// Create Context
const LocationContext = createContext();

// Export Provider
export const LocationProvider = ({ children }) => {
    const [locationData, setLocationData] = useState(null);

    return (
        <LocationContext.Provider value={{ locationData, setLocationData }}>
            {children}
        </LocationContext.Provider>
    );

};

export const useLocationContext = () => useContext(LocationContext);