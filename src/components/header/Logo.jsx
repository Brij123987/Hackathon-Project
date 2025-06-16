import './Logo.css';
import { useNavigate  } from 'react-router-dom';


function Logo() {

  const navigate = useNavigate();

  const handleHomeView = () => {
    navigate('/');
  }

  return (
    <div className="logo"
      onClick={handleHomeView}
    >
      <h2>Disastra Logo</h2>
    </div>
  );
}

export default Logo;
