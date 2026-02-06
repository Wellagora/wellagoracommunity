import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// DEPRECATED: This page was for browsing challenges, which have been removed.
// Redirecting to programs page instead.

const BrowseProgramsPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to programs page since challenges are deprecated
    navigate('/programs', { replace: true });
  }, [navigate]);

  return null;
};

export default BrowseProgramsPage;
