import { Link } from 'react-router-dom';
import '../css/Home.css';

export default function Home() {
  return (
    <div className="home-container">
      <h1>Traffic Control Tracker</h1>
      <p>
      Cette application affiche en temps réel les lieux de contrôle routier gérés par la police. Les marqueurs indiquent où les contrôles de circulation ont actuellement lieu.
      </p>
      <p>
      Vous pouvez ajouter de nouveaux points de contrôle ou supprimer ceux existants pour aider à maintenir la carte à jour avec des informations actuelles.
      </p>
      <Link to="/map" className="primary-button">
        View Traffic Control Map
      </Link>
    </div>
  );
}