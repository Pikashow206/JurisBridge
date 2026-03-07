import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const LawyerDashboard = () => {
  const { isLawyer } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // The main Dashboard component handles lawyer view
    // This route just redirects
    navigate('/dashboard');
  }, [navigate]);

  return null;
};

export default LawyerDashboard;