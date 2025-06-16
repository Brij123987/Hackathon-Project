function Features () {
    return (
        <section id="features" className="py-16 px-6 md:px-20 bg-white">
        <h2 className="text-3xl font-bold mb-10 text-center">Core Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div className="p-6 bg-gray-100 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Real-time Alerts</h3>
            <p>Stay informed with instant notifications for earthquakes, cyclones, floods, and more.</p>
          </div>
          <div className="p-6 bg-gray-100 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Disaster Prediction</h3>
            <p>Predict natural disasters using historical data and AI models with high accuracy.</p>
          </div>
          <div className="p-6 bg-gray-100 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Interactive Graphs</h3>
            <p>Visualize affected areas using satellite imagery and geospatial overlays.</p>
          </div>
        </div>
      </section>
    );
}

export default Features;