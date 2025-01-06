import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const Settings = ({ setThemeMode }) => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQRCodeData] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleThemeChange = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    setThemeMode(newMode ? 'dark' : 'light');
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    updateThemePreference(newMode ? 'dark' : 'light');
  };

  const updateThemePreference = async (theme) => {
    try {
      await axios.post('/api/auth/update-theme', { theme });
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  const handleEnable2FA = async () => {
    try {
      const response = await axios.post('/api/auth/enable-2fa');
      setQRCodeData(response.data);
      setShowQRCode(true);
    } catch (error) {
      setError('Failed to enable 2FA');
    }
  };

  const handleVerify2FA = async () => {
    try {
      await axios.post('/api/auth/verify-2fa', {
        token: verificationCode
      });
      setTwoFactorEnabled(true);
      setShowQRCode(false);
      setSuccess('2FA enabled successfully');
    } catch (error) {
      setError('Invalid verification code');
    }
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Appearance
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={handleThemeChange}
              />
            }
            label="Dark Mode"
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Security
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={twoFactorEnabled}
                onChange={() => !twoFactorEnabled && handleEnable2FA()}
                disabled={twoFactorEnabled}
              />
            }
            label="Two-Factor Authentication"
          />
          {twoFactorEnabled && (
            <Typography variant="body2" color="text.secondary">
              2FA is enabled for your account
            </Typography>
          )}
        </Box>
      </Paper>

      <Dialog open={showQRCode} onClose={() => setShowQRCode(false)}>
        <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            1. Scan this QR code with your authenticator app
          </Typography>
          {qrCodeData && (
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <img src={qrCodeData.qrCodeUrl} alt="2FA QR Code" />
            </Box>
          )}
          <Typography variant="body1" paragraph>
            2. Enter the verification code from your authenticator app
          </Typography>
          <TextField
            fullWidth
            label="Verification Code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQRCode(false)}>Cancel</Button>
          <Button onClick={handleVerify2FA} variant="contained">
            Verify
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Settings;
