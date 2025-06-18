import './Logo.css';
import { useNavigate } from 'react-router-dom';

function Logo() {
  const navigate = useNavigate();

  const handleHomeView = () => {
    navigate('/');
  }

  return (
    <div className="logo" onClick={handleHomeView}>
      <div className="logo-content">
        <div className="logo-icon">🌪️</div>
        <div className="logo-text">
          <h2 className="logo-title">DisasterAlert</h2>
          <p className="logo-subtitle">AI-Powered Protection</p>
        </div>
      </div>
    </div>
  );
}

export default Logo;