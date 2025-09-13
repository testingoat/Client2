import { ComponentLoader } from 'adminjs';

const componentLoader = new ComponentLoader();

const Components = {
  MonitoringComponent: componentLoader.add('MonitoringComponent', './monitoring-component'),
  NotificationCenterComponent: componentLoader.add('NotificationCenterComponent', './notification-center-component'),
};

export { componentLoader, Components };
