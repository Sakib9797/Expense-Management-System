
import { useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import Welcome from './Welcome';

const Index = () => {
  const { user, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  // Just render the Welcome page for now
  return <Welcome />;
};

export default Index;
