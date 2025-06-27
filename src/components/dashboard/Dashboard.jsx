import React, { useState, useEffect } from 'react';
import { useAuth } from '../userSystem/AuthContext';
import { useLocationContext } from '../userSystem/LocationContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const { locationData } = useLocationContext();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  const upcomingFeatures = [
    {
      icon: '📊',
      title: 'Personal Analytics',
      description: 'Detailed insights into disaster patterns in your area',
      status: 'In Development'
    },
    {
      icon: '🎯',
      title: 'Custom Alert Settings',
      description: 'Personalize your notification preferences and thresholds',
      status: 'Coming Soon'
    },
    {
      icon: '📱',
      title: 'Mobile App Integration',
      description: 'Native mobile app with offline capabilities',
      status: 'Planned'
    },
    {
      icon: '🤝',
      title: 'Community Features',
      description: 'Connect with neighbors and share safety information',
      status: 'Planned'
    },
    {
      icon: '📈',
      title: 'Historical Data Trends',
      description: 'Long-term disaster pattern analysis and predictions',
      status: 'In Development'
    },
    {
      icon: '🚨',
      title: 'Emergency Contacts',
      description: 'Quick access to emergency services and contacts',
      status: 'Coming Soon'
    }
  ];

  const quickActions = [
    {
      icon: '🌍',
      title: 'View Earthquake Data',
      description: 'Check latest earthquake information',
      action: () => navigate('/graphs'),
      color: 'from-red-400 to-red-500'
    },
    {
      icon: '🌪️',
      title: 'View Cyclone Data',
      description: 'Monitor cyclone activity',
      action: () => navigate('/graphs'),
      color: 'from-blue-400 to-blue-500'
    },
    {
      icon: '📞',
      title: 'Contact Support',
      description: 'Get help or report issues',
      action: () => navigate('/contact'),
      color: 'from-green-400 to-green-500'
    },
    {
      icon: 'ℹ️',
      title: 'Learn More',
      description: 'About our disaster management system',
      action: () => navigate('/about'),
      color: 'from-purple-400 to-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-16 px-6 md:px-20 bg-gradient-to-r from-blue-400 to-indigo-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full transform -translate-x-16 translate-y-16"></div>
        
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="mb-6">
              <span className="text-6xl mb-4 block animate-bounce">🚀</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Dashboard <span className="text-blue-100">Coming Soon</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-50 max-w-3xl mx-auto leading-relaxed mb-6">
              We're building an amazing dashboard experience for you
            </p>
            
            {/* User Welcome */}
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="text-2xl">👋</span>
                <span className="text-lg font-semibold">Welcome back!</span>
              </div>
              {locationData && (
                <p className="text-black text-lg">
                  📍 <b>Monitoring disasters for {locationData.city}</b>
                </p>
              )}
              <div className="text-black text-sm mt-2">
                🕐 {currentTime.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 px-6 md:px-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-700 mb-4">
              What You Can Do Right Now
            </h2>
            <p className="text-xl text-gray-600">
              While we're building your dashboard, explore these features
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <div
                key={index}
                onClick={action.action}
                className="group cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden"
              >
                <div className={`h-2 bg-gradient-to-r ${action.color}`}></div>
                <div className="p-6">
                  <div className="text-center">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {action.icon}
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {action.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon Features */}
      <section className="py-16 px-6 md:px-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-700 mb-4">
              Exciting Features Coming Soon
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're working hard to bring you the most comprehensive disaster management dashboard
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-800">
                          {feature.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          feature.status === 'In Development' 
                            ? 'bg-blue-100 text-blue-800' 
                            : feature.status === 'Coming Soon'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {feature.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Progress bar for visual appeal */}
                <div className="h-1 bg-gray-100">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      feature.status === 'In Development' 
                        ? 'bg-blue-500 w-3/4' 
                        : feature.status === 'Coming Soon'
                        ? 'bg-green-500 w-1/2'
                        : 'bg-gray-400 w-1/4'
                    }`}
                    style={{
                      animationDelay: `${index * 200}ms`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Development Timeline */}
      <section className="py-16 px-6 md:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-700 mb-4">
              Development Timeline
            </h2>
            <p className="text-xl text-gray-600">
              Here's what we're working on and when you can expect it
            </p>
          </div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full"></div>
            
            <div className="space-y-12">
              {[
                {
                  phase: 'Phase 1',
                  title: 'Core Dashboard Features',
                  date: 'Q1 2025',
                  items: ['Personal Analytics', 'Custom Alert Settings', 'Enhanced UI'],
                  status: 'active'
                },
                {
                  phase: 'Phase 2',
                  title: 'Mobile & Community',
                  date: 'Q2 2025',
                  items: ['Mobile App', 'Community Features', 'Offline Mode'],
                  status: 'upcoming'
                },
                {
                  phase: 'Phase 3',
                  title: 'Advanced Features',
                  date: 'Q3 2025',
                  items: ['AI Predictions', 'Historical Trends', 'Emergency Integration'],
                  status: 'planned'
                }
              ].map((phase, index) => (
                <div key={index} className="relative">
                  <div className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className="flex-1">
                      <div className={`bg-white rounded-xl shadow-sm p-6 border-2 ${
                        phase.status === 'active' 
                          ? 'border-blue-400 bg-blue-50' 
                          : phase.status === 'upcoming'
                          ? 'border-green-400 bg-green-50'
                          : 'border-gray-300'
                      } ${index % 2 === 0 ? 'mr-8' : 'ml-8'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            phase.status === 'active' 
                              ? 'bg-blue-100 text-blue-800' 
                              : phase.status === 'upcoming'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {phase.phase}
                          </span>
                          <span className="text-sm text-gray-500 font-medium">
                            {phase.date}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">
                          {phase.title}
                        </h3>
                        <ul className="space-y-1">
                          {phase.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="text-gray-600 text-sm flex items-center">
                              <span className="text-green-500 mr-2">✓</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    {/* Timeline dot */}
                    <div className={`absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white ${
                      phase.status === 'active' 
                        ? 'bg-blue-500' 
                        : phase.status === 'upcoming'
                        ? 'bg-green-500'
                        : 'bg-gray-400'
                    } shadow-lg`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stay Updated */}
      <section className="py-16 px-6 md:px-20 bg-gradient-to-r from-blue-400 to-indigo-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Stay Updated</h2>
          <p className="text-xl text-blue-50 mb-8 max-w-2xl mx-auto">
            We'll notify you as soon as new dashboard features become available. 
            In the meantime, continue using our current disaster monitoring tools.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/graphs')}
              className="px-8 py-4 bg-white text-blue-500 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-md"
            >
              📊 View Current Data
            </button>
            <button 
              onClick={() => navigate('/contact')}
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-500 transition-colors"
            >
              💬 Send Feedback
            </button>
          </div>
          
          <div className="mt-8 text-blue-100 text-sm">
            <p>🔔 You'll receive notifications when new features are ready</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;