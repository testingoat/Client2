import React from 'react';
import { Box, Text, Card, CardBody } from '@adminjs/design-system';

const NotificationCenterComponent = (props) => {
  const { message } = props.data || {};

  return (
    <Box variant="grey">
      <Box variant="white" m={20}>
        <Text variant="h4">📱 Notification Center</Text>
        <Text mt="default">Send push notifications and SMS to your users</Text>
        
        <Card mt="xl">
          <CardBody>
            <Text variant="h6">Welcome Message</Text>
            <Text variant="sm">{message || 'Welcome to the Notification Center'}</Text>
            <Text variant="sm" mt="sm">
              This feature allows you to send notifications to users via Push Notifications (FCM) and SMS (Fast2SMS).
            </Text>
            <Text variant="sm" mt="sm">
              Full notification interface is coming soon with form controls for composing and sending messages.
            </Text>
          </CardBody>
        </Card>

        <Card mt="lg">
          <CardBody>
            <Text variant="h6">Available Features (Coming Soon)</Text>
            <Text variant="sm">• Push Notifications via Firebase Cloud Messaging</Text>
            <Text variant="sm">• SMS Notifications via Fast2SMS API</Text>
            <Text variant="sm">• Target specific users or groups</Text>
            <Text variant="sm">• Template management</Text>
            <Text variant="sm">• Notification history and analytics</Text>
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
};

export default NotificationCenterComponent;
