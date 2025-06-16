function LiveAlerts () {
    return (
        <section id="alerts" className="py-16 px-6 md:px-20 bg-blue-50">
            <h2 className="text-3xl font-bold mb-8 text-center">Live Disaster Alerts</h2>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
                <p className="text-lg font-semibold text-red-600">🚨 Cyclone Warning near Bay of Bengal</p>
                <p className="text-sm text-gray-600 mt-2">Wind speed: 120 km/h | Pressure: 980 hPa | Updated: 5 mins ago</p>
            </div>
            <br></br>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
                <p className="text-lg font-semibold text-red-600">🚨 EarthQuake Warning near Bay of Bengal</p>
                <p className="text-sm text-gray-600 mt-2">Predicted Magnitude: 4.6 | Expected In Hours: 12.9 | EarthQuake Prediction: Medium</p>
            </div>
        </section>

       
            
     
    );
}

export default LiveAlerts;