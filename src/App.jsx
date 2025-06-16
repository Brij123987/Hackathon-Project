import React from 'react';
import Header from './components/header/Header';
import Logo from './components/header/Logo';
import DropDownPanel from './components/header/DropDownPanel';
import Footer from './components/footer/Footer';
import Home from './components/homepage/Home';
import './App.css'; // Ensure global styles applied here

function App() {
  return (
    <div className="appContainer">
      <Header>
        <Logo />
        <DropDownPanel />
      </Header>

      <div className="content">
        <Home></Home>
      </div>

      <Footer />
    </div>
  );
}

export default App;

