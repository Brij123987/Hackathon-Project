import React, { useState, useEffect } from 'react';
import { useAuth } from '../userSystem/AuthContext';
import { useNavigate } from "react-router-dom";



function AboutPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-20 px-6 md:px-20 bg-gradient-to-r from-blue-400 to-indigo-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full transform -translate-x-16 translate-y-16"></div>
        
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="mb-6">
            <span className="text-6xl mb-4 block animate-pulse">🌍</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            About <span className="text-blue-100">DisasterAlert</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-50 max-w-3xl mx-auto leading-relaxed">
            AI-Powered Disaster Management System for Real-time Risk Detection and Early Warnings
          </p>
          <div className="mt-8 flex justify-center">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-6 py-3">
              <span className="text-black font-semibold">Next-Gen Disaster Intelligence for a Safer Tomorrow</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6 md:px-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-700 mb-6">Our Mission</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 mx-auto mb-8"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-blue-100 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-4">🎯</span>
                  <h3 className="text-xl font-bold text-gray-700">Our Purpose</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  To revolutionize disaster management through cutting-edge AI technology, providing real-time risk detection 
                  and early warning systems that save lives and protect communities worldwide.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-blue-100 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-4">🌟</span>
                  <h3 className="text-xl font-bold text-gray-700">Our Vision</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  A world where every community has access to intelligent disaster prediction and response systems, 
                  minimizing the impact of natural disasters through proactive technology solutions.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">Why DisasterAlert?</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-4">⚡</span>
                    <span>Real-time AI-powered predictions</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-2xl mr-4">📱</span>
                    <span>Instant SMS and mobile alerts</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-2xl mr-4">🗺️</span>
                    <span>Location-based personalized warnings</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-2xl mr-4">📊</span>
                    <span>Interactive data visualization</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-2xl mr-4">🔒</span>
                    <span>Secure and privacy-focused</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 px-6 md:px-20 bg-gradient-to-br from-blue-25 to-indigo-25">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-700 mb-6">Our Technology</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powered by advanced AI algorithms and real-time data processing
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-blue-100">
              <div className="text-center">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-3">Machine Learning</h3>
                <p className="text-gray-600">
                  Advanced ML algorithms analyze historical data patterns to predict earthquake magnitudes and cyclone formations with high accuracy.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-blue-100">
              <div className="text-center">
                <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🛰️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-3">Satellite Data</h3>
                <p className="text-gray-600">
                  Real-time satellite imagery and sensor data provide comprehensive monitoring of weather patterns and seismic activities.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-blue-100">
              <div className="text-center">
                <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📡</span>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-3">Real-time Processing</h3>
                <p className="text-gray-600">
                  Lightning-fast data processing ensures immediate alert delivery when disasters are detected or predicted.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 px-6 md:px-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-700 mb-6">Our Impact</h2>
            <p className="text-xl text-gray-600">Making a difference in disaster preparedness worldwide</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-400 to-blue-500 text-white rounded-2xl p-6 mb-4 shadow-sm">
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-blue-100">Monitoring</div>
              </div>
              <h3 className="font-semibold text-gray-700">Continuous Surveillance</h3>
              <p className="text-gray-600 text-sm">Round-the-clock disaster monitoring</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-400 to-green-500 text-white rounded-2xl p-6 mb-4 shadow-sm">
                <div className="text-3xl font-bold">75%</div>
                <div className="text-green-100">Accuracy</div>
              </div>
              <h3 className="font-semibold text-gray-700">Prediction Accuracy</h3>
              <p className="text-gray-600 text-sm">High-precision disaster forecasting</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-400 to-purple-500 text-white rounded-2xl p-6 mb-4 shadow-sm">
                <div className="text-3xl font-bold">{'<30s'}</div>
                <div className="text-purple-100">Response</div>
              </div>
              <h3 className="font-semibold text-gray-700">Alert Speed</h3>
              <p className="text-gray-600 text-sm">Lightning-fast emergency notifications</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-br from-orange-400 to-orange-500 text-white rounded-2xl p-6 mb-4 shadow-sm">
                <div className="text-3xl font-bold">Global</div>
                <div className="text-orange-100">Coverage</div>
              </div>
              <h3 className="font-semibold text-gray-700">Worldwide Reach</h3>
              <p className="text-gray-600 text-sm">International disaster monitoring</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-6 md:px-20 bg-gradient-to-br from-blue-25 to-indigo-25">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-700 mb-6">Our Commitment</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Dedicated to protecting communities through innovative technology and continuous improvement
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm text-center hover:shadow-md transition-shadow duration-300 border border-blue-100">
              <div className="text-4xl mb-4">🔬</div>
              <h3 className="text-xl font-bold text-gray-700 mb-3">Research & Development</h3>
              <p className="text-gray-600">
                Continuous innovation in AI algorithms and disaster prediction methodologies to improve accuracy and response times.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm text-center hover:shadow-md transition-shadow duration-300 border border-blue-100">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-gray-700 mb-3">Community Partnership</h3>
              <p className="text-gray-600">
                Working closely with government agencies, NGOs, and local communities to ensure effective disaster response coordination.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm text-center hover:shadow-md transition-shadow duration-300 border border-blue-100">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-bold text-gray-700 mb-3">Sustainable Future</h3>
              <p className="text-gray-600">
                Building resilient communities through technology that adapts to climate change and evolving disaster patterns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 md:px-20 bg-gradient-to-r from-blue-400 to-indigo-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Our Mission</h2>
          <p className="text-xl text-blue-50 mb-8 max-w-2xl mx-auto">
            Be part of the next generation of disaster preparedness. Sign up today and help us build safer communities worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!isAuthenticated && (
              <button 
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-white text-blue-500 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-sm"
              >
                Get Started Today
              </button>
            )}
            <button 
              onClick={() => navigate('/contact')}
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-500 transition-colors"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;