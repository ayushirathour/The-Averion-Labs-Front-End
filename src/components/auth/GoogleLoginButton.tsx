
import React, { useState, useEffect } from 'react';
import authService from '../../services/auth';
import { Button } from '../ui';

const GoogleLoginButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleAuthAvailable, setIsGoogleAuthAvailable] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { available } = await authService.checkGoogleStatus();
        setIsGoogleAuthAvailable(available);
      } catch (error) {
        setIsGoogleAuthAvailable(false);
      }
    };

    checkStatus();
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { login_url } = await authService.getGoogleLoginUrl();
      window.location.href = login_url;
    } catch (err) {
      setIsLoading(false);
    }
  };

  if (!isGoogleAuthAvailable) {
    return null;
  }

  return (
    <Button
      onClick={handleGoogleLogin}
      loading={isLoading}
      variant="outline"
      className="w-full"
    >
      Sign in with Google
    </Button>
  );
};

export default GoogleLoginButton;

