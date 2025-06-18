import './DropDownPanel.css';
import { useNavigate } from 'react-router-dom';

function DropDownPanel() {

  const navigate = useNavigate();

  const handleHomeView = () => {
    navigate('/');
  }

  const handleSignUpView = () => {
    navigate('/signup');
  }

  const handleLoginView = () => {
    navigate('/login');
  }

  return (
    <div className="dropdown-panel">
      <ul>
        <li 
        onClick={handleHomeView} 
        >Home</li>
        <li>Track Earthquake</li>
        <li>Track Cyclone</li>
        <li>About</li>
        <li>Contact</li>
        <li
          onClick={handleSignUpView}
        >Sign Up</li>
        <li
          onClick={handleLoginView}
        >Login</li>
      </ul>
    </div>
  );
}

export default DropDownPanel;
