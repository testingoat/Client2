import { ComponentLoader } from 'adminjs';

const componentLoader = new ComponentLoader();

// Use relative paths from src directory
const Components = {
  MonitoringComponent: componentLoader.add('MonitoringComponent', './src/adminjs/components/monitoring-component'),
  NotificationCenterComponent: componentLoader.add('NotificationCenterComponent', './src/adminjs/components/notification-center-component'),
};

export { componentLoader, Components };
