// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/header/Header';
import Logo from './components/header/Logo';
import DropDownPanel from './components/header/DropDownPanel';
import Footer from './components/footer/Footer';
import Home from './components/homepage/Home';
import GraphView from './components/graphDataView/GraphView'; // Create this component
import UserRegistration from './components/userSystem/UserRegistration';
import UserLogin from './components/userSystem/UserLogin';
import { LocationProvider } from './components/userSystem/LocationContext';
import { AuthProvider } from './components/userSystem/AuthContext';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="appContainer">
          <Header>
            <Logo />
            <DropDownPanel />
          </Header>

          <div className="content">
            
            <LocationProvider>
              <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/graphs" element={<GraphView location="Unknown" />} />
                  <Route path="/signup" element={< UserRegistration />} />
                  <Route path="/login" element={<UserLogin /> } />
              </Routes>
            </LocationProvider>

          </div>

          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;