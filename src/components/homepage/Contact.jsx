import React, { useState } from 'react';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 px-6 md:px-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full transform -translate-x-16 translate-y-16"></div>
        
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="mb-6">
            <span className="text-6xl mb-4 block animate-bounce">📞</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Contact <span className="text-blue-200">Us</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Get in touch with our team for support, partnerships, or general inquiries
          </p>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="py-16 px-6 md:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Send us a Message</h2>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="partnership">Partnership</option>
                    <option value="media">Media & Press</option>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
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
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {submitMessage}
                  </div>
                )}
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Contact Cards */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Get in Touch</h3>
                
                <div className="space-y-6">
                  {/* Emergency Contact */}
                  <div className="flex items-start space-x-4 p-4 bg-red-50 rounded-xl border border-red-200">
                    <div className="bg-red-100 p-3 rounded-full">
                      <span className="text-2xl">🚨</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-red-800">Emergency Hotline</h4>
                      <p className="text-red-700">+1-800-DISASTER</p>
                      <p className="text-sm text-red-600">24/7 Emergency Support</p>
                    </div>
                  </div>

                  {/* General Contact */}
                  <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <span className="text-2xl">📧</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-800">General Inquiries</h4>
                      <p className="text-blue-700">info@disasteralert.com</p>
                      <p className="text-sm text-blue-600">Response within 24 hours</p>
                    </div>
                  </div>

                  {/* Technical Support */}
                  <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="bg-green-100 p-3 rounded-full">
                      <span className="text-2xl">🛠️</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-green-800">Technical Support</h4>
                      <p className="text-green-700">support@disasteralert.com</p>
                      <p className="text-sm text-green-600">Mon-Fri, 9AM-6PM EST</p>
                    </div>
                  </div>

                  {/* Partnership */}
                  <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <span className="text-2xl">🤝</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-purple-800">Partnerships</h4>
                      <p className="text-purple-700">partners@disasteralert.com</p>
                      <p className="text-sm text-purple-600">Business collaborations</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Office Information */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Our Offices</h3>
                
                <div className="space-y-6">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-bold text-gray-800">Headquarters</h4>
                    <p className="text-gray-600">
                      123 Innovation Drive<br />
                      Tech Valley, CA 94000<br />
                      United States
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-bold text-gray-800">Research Center</h4>
                    <p className="text-gray-600">
                      456 Science Park<br />
                      Boston, MA 02101<br />
                      United States
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-bold text-gray-800">International Office</h4>
                    <p className="text-gray-600">
                      789 Global Plaza<br />
                      London, UK EC1A 1BB<br />
                      United Kingdom
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">Follow Us</h3>
                <p className="text-blue-100 mb-6">
                  Stay updated with the latest disaster alerts and safety tips
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <a href="#" className="flex items-center space-x-3 bg-white bg-opacity-20 rounded-lg p-3 hover:bg-opacity-30 transition-colors">
                    <span className="text-xl">📘</span>
                    <span className="font-medium">Facebook</span>
                  </a>
                  <a href="#" className="flex items-center space-x-3 bg-white bg-opacity-20 rounded-lg p-3 hover:bg-opacity-30 transition-colors">
                    <span className="text-xl">🐦</span>
                    <span className="font-medium">Twitter</span>
                  </a>
                  <a href="#" className="flex items-center space-x-3 bg-white bg-opacity-20 rounded-lg p-3 hover:bg-opacity-30 transition-colors">
                    <span className="text-xl">💼</span>
                    <span className="font-medium">LinkedIn</span>
                  </a>
                  <a href="#" className="flex items-center space-x-3 bg-white bg-opacity-20 rounded-lg p-3 hover:bg-opacity-30 transition-colors">
                    <span className="text-xl">📺</span>
                    <span className="font-medium">YouTube</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6 md:px-20 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">
              Quick answers to common questions about DisasterAlert
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-3">How accurate are your disaster predictions?</h3>
              <p className="text-gray-600">
                Our AI-powered system achieves 95% accuracy in disaster prediction by analyzing historical data, 
                real-time satellite imagery, and sensor networks. We continuously improve our algorithms to enhance precision.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Is my location data secure?</h3>
              <p className="text-gray-600">
                Yes, we use enterprise-grade encryption to protect your data. Location information is used solely for 
                providing personalized disaster alerts and is never shared with third parties.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-3">How quickly do I receive alerts?</h3>
              <p className="text-gray-600">
                Our system delivers alerts within 30 seconds of detection. SMS notifications are sent immediately, 
                and mobile app notifications are pushed in real-time to ensure you're informed as quickly as possible.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Can I customize my alert preferences?</h3>
              <p className="text-gray-600">
                Absolutely! You can customize alert types, severity levels, notification methods, and quiet hours 
                through your account settings to receive only the most relevant information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 md:px-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust DisasterAlert for their safety. Sign up today and stay protected.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.location.href = '/signup'}
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
            >
              Create Free Account
            </button>
            <button 
              onClick={() => window.location.href = '/about'}
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-colors"
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