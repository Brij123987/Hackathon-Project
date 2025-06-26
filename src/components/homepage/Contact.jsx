import axios from 'axios';
import React, { useState, useEffect } from 'react';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    // Simulate form submission
    try {
      const messageData = {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        inquiryType: formData.inquiryType

      }

      const response = await axios.post(
        `${API_BASE_URL}/user/send_user_support_email/`,
        messageData,
      )

      console.log(response)

      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitMessage('✅ Thank you for your message! We\'ll get back to you within 24 hours.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        inquiryType: 'general'
      });
    } catch (error) {
      setSubmitMessage('❌ Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <span className="text-6xl mb-4 block animate-bounce">📞</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Contact <span className="text-blue-100">Us</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-50 max-w-3xl mx-auto leading-relaxed">
            Get in touch with our team for support, partnerships, or general inquiries
          </p>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="py-16 px-6 md:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-blue-100">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-700 mb-4">Send us a Message</h2>
                <p className="text-gray-600">
                  We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Inquiry Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Inquiry Type
                  </label>
                  <select
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="feedback">Feedback</option>
                    <option value="emergency">Emergency Services</option>
                  </select>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    placeholder="Brief description of your inquiry"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows="5"
                    placeholder="Please provide details about your inquiry..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-vertical"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-semibold rounded-lg hover:from-blue-500 hover:to-indigo-600 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">📤</span>
                      Send Message
                    </>
                  )}
                </button>

                {/* Submit Message */}
                {submitMessage && (
                  <div className={`p-4 rounded-lg text-sm ${
                    submitMessage.includes('✅') 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {submitMessage}
                  </div>
                )}
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Contact Cards */}
              <div className="bg-white rounded-2xl shadow-sm p-8 border border-blue-100">
                <h3 className="text-2xl font-bold text-gray-700 mb-6">Get in Touch</h3>
                
                <div className="space-y-6">
                  {/* Emergency Contact */}
                  <div className="flex items-start space-x-4 p-4 bg-red-25 rounded-xl border border-red-100">
                    <div className="bg-red-50 p-3 rounded-full">
                      <span className="text-2xl">🚨</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-red-700">Emergency Hotline</h4>
                      <p className="text-red-600">+91 9867839043</p>
                      <p className="text-sm text-red-500">24/7 Emergency Support</p>
                    </div>
                  </div>

                  {/* General Contact */}
                  <div className="flex items-start space-x-4 p-4 bg-blue-25 rounded-xl border border-blue-100">
                    <div className="bg-blue-50 p-3 rounded-full">
                      <span className="text-2xl">📧</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-700">General Inquiries</h4>
                      <p className="text-blue-600">brijeshyadav9811@gmail.com</p>
                      <p className="text-sm text-blue-500">Response within 24 hours</p>
                    </div>
                  </div>

                  {/* Technical Support */}
                  <div className="flex items-start space-x-4 p-4 bg-green-25 rounded-xl border border-green-100">
                    <div className="bg-green-50 p-3 rounded-full">
                      <span className="text-2xl">🛠️</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-green-700">Technical Support</h4>
                      <p className="text-green-600">brijeshyadav9811@gmail.com</p>
                      <p className="text-sm text-green-500">Sat-Sun, 9AM-6PM EST</p>
                    </div>
                  </div>

                  {/* Partnership */}
                  {/* <div className="flex items-start space-x-4 p-4 bg-purple-25 rounded-xl border border-purple-100">
                    <div className="bg-purple-50 p-3 rounded-full">
                      <span className="text-2xl">🤝</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-purple-700">Partnerships</h4>
                      <p className="text-purple-600">partners@disasteralert.com</p>
                      <p className="text-sm text-purple-500">Business collaborations</p>
                    </div>
                  </div> */}
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl shadow-sm p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">Why Choose DisasterAlert?</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-4">⚡</span>
                    <span>24/7 real-time monitoring</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-2xl mr-4">🎯</span>
                    <span>75% prediction accuracy</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-2xl mr-4">📱</span>
                    <span>Instant mobile alerts</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-2xl mr-4">🌍</span>
                    <span>Global coverage</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-2xl mr-4">🔒</span>
                    <span>Secure & private</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 md:px-20 bg-gradient-to-r from-blue-400 to-indigo-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-50 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust DisasterAlert for their safety. Sign up today and stay protected.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!isAuthenticated && (
            <button 
              onClick={() => window.location.href = '/signup'}
              className="px-8 py-4 bg-white text-blue-500 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-sm"
            >
              Create Free Account
            </button>
          )}
            <button 
              onClick={() => window.location.href = '/about'}
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-500 transition-colors"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;