import React from 'react';
import { Box, Text, Card, CardHeader, CardBody, Badge } from '@adminjs/design-system';

const MonitoringComponent = (props) => {
  const { serverHealth, message, timestamp } = props.data || {};

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatMemory = (bytes) => {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <Box variant="grey">
      <Box variant="white" m={20}>
        <Text variant="h4">🚀 GoatGoat Server Monitoring</Text>
        <Text mt="default">Real-time server health and performance metrics</Text>
        
        {serverHealth && (
          <>
            <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap="lg" mt="xl">
              <Card>
                <CardHeader>
                  <Text variant="h6">🏥 Server Health</Text>
                </CardHeader>
                <CardBody>
                  <Badge color={serverHealth.status === 'healthy' ? 'success' : 'danger'} size="lg">
                    {serverHealth.status === 'healthy' ? '✅ HEALTHY' : '❌ UNHEALTHY'}
                  </Badge>
                  <Text variant="sm" mt="sm">Database: {serverHealth.database}</Text>
                  <Text variant="sm">Uptime: {formatUptime(serverHealth.uptime)}</Text>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Text variant="h6">💾 Memory Usage</Text>
                </CardHeader>
                <CardBody>
                  <Text variant="sm">RSS: {formatMemory(serverHealth.memory.rss)}</Text>
                  <Text variant="sm">Heap Used: {formatMemory(serverHealth.memory.heapUsed)}</Text>
                  <Text variant="sm">Heap Total: {formatMemory(serverHealth.memory.heapTotal)}</Text>
                  <Text variant="sm">External: {formatMemory(serverHealth.memory.external)}</Text>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Text variant="h6">📊 System Info</Text>
                </CardHeader>
                <CardBody>
                  <Text variant="sm">Status: {serverHealth.status}</Text>
                  <Text variant="sm">Database: {serverHealth.database}</Text>
                  <Text variant="sm">Environment: {process.env.NODE_ENV}</Text>
                  <Text variant="sm">Platform: Node.js</Text>
                </CardBody>
              </Card>
            </Box>

            <Card mt="xl">
              <CardHeader>
                <Text variant="h6">📈 Raw Data</Text>
              </CardHeader>
              <CardBody>
                <Text variant="sm">Message: {message}</Text>
                <Text variant="sm">Last Updated: {timestamp}</Text>
                <Text variant="sm" mt="sm">Memory Usage: {JSON.stringify(serverHealth.memory, null, 2)}</Text>
              </CardBody>
            </Card>
          </>
        )}

        {!serverHealth && (
          <Card mt="xl">
            <CardBody>
              <Text>Loading server health data...</Text>
              <Text variant="sm">Message: {message}</Text>
              <Text variant="sm">Timestamp: {timestamp}</Text>
            </CardBody>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default MonitoringComponent;
