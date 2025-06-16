function HeroSection () {
    return(
        <section className="flex flex-col items-center text-center py-20 bg-gradient-to-r from-blue-100 to-blue-200">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">AI-Powered Disaster Management System</h1>
        <p className="text-lg md:text-xl max-w-2xl">
          Predict, detect, and respond to natural disasters in real-time using satellite data, machine learning, and location intelligence.
        </p>
        <button className="mt-8 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow hover:bg-blue-700 transition">
          Get Started
        </button>
      </section>
    );
}

export default HeroSection;