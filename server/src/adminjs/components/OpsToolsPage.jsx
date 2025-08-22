import React, { useState } from 'react';
import { Box, H2, Text, Input, Button, CheckBox } from '@adminjs/design-system';
import { ApiClient } from 'adminjs';

const api = new ApiClient();

const OpsToolsPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dryRun, setDryRun] = useState(true);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendTestOtp = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await api.post({
        url: '/admin/ops/test-otp', // This matches our backend route
        data: { phoneNumber, dryRun },
      });
      setMessage(response.data.message || 'Test OTP request sent successfully!');
    } catch (error) {
      console.error('Error sending test OTP:', error);
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box variant="grey">
      <H2>Ops Tools</H2>
      <Text>Send Test OTP</Text>
      <Box mt="xl">
        <Input
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          width="100%"
        />
      </Box>
      <Box mt="default">
        <CheckBox
          id="dryRun"
          checked={dryRun}
          onChange={() => setDryRun(!dryRun)}
        />
        <label htmlFor="dryRun">Dry Run (no actual SMS sent)</label>
      </Box>
      <Box mt="xl">
        <Button onClick={handleSendTestOtp} disabled={loading}>
          {loading ? 'Sending...' : 'Send Test OTP'}
        </Button>
      </Box>
      {message && (
        <Box mt="default">
          <Text>{message}</Text>
        </Box>
      )}
    </Box>
  );
};

export default OpsToolsPage;
