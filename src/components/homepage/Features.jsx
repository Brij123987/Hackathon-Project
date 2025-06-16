function Features () {
    return (
        <section id="features" className="py-16 px-6 md:px-20 bg-white">
        <h2 className="text-3xl font-bold mb-10 text-center">Core Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div className="p-6 bg-gray-100 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Real-time Alerts</h3>
            <p>Stay informed with instant notifications for earthquakes, cyclones, floods, and more.</p>
            <p className="text-sm text-yellow-600 mb-4 italic">
            ⚠️ By clicking the button, your location will be used and stored securely to provide disaster alerts.
            </p>

            <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition"
            >
                Track Nearby Disasters
            </button>
          </div>


          <div className="p-6 bg-gray-100 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Disaster Prediction</h3>
            <p>Predict natural disasters using historical data and AI models with high accuracy.</p>
          </div>


          <div className="p-6 bg-gray-100 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Interactive Graphs</h3>
            <p>Visualize affected areas using satellite imagery and geospatial overlays.</p>

            <br></br>
            <p className="text-sm text-green-600 mb-4 italic">
                📊 By clicking the button, you will be redirected to a graph showing disaster data based on your current location.
            </p>
            <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition"
            >
                Graph View
            </button>
          </div>


        </div>
      </section>
    );
}

export default Features;