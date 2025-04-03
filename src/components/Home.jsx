import { Link } from 'react-router-dom';
import '../css/Home.css';

export default function Home() {
  return (
    <div className="home-container">
      <h1>Traffic Control Tracker</h1>
      <p>
        This app shows real-time traffic control locations managed by police. 
        The markers indicate where traffic checks are currently happening.
      </p>
      <p>
        You can add new control points or remove existing ones to help keep 
        the map updated with current information.
      </p>
      <Link to="/map" className="primary-button">
        View Traffic Control Map
      </Link>
    </div>
  );
}