import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Custom hook to handle authentication redirect
 * Prevents redirect on page refresh while Redux state is hydrating
 * @param {boolean} requireAdmin - If true, requires user to be admin
 */
export const useAuthRedirect = (requireAdmin = false) => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    // Small delay to allow Redux persist to hydrate state
    const timer = setTimeout(() => {
      if (!currentUser) {
        // User not logged in
        navigate('/');
      } else if (requireAdmin && !currentUser.isAdmin) {
        // User logged in but not admin when admin required
        navigate('/home');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [currentUser, navigate, requireAdmin]);

  return currentUser;
};
