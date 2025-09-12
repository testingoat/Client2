/**
 * Calculates the distance between two points using the Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Calculates ETA in minutes based on distance and average speed
 * @param distance Distance in kilometers
 * @param averageSpeed Average speed in km/h (default: 30 km/h for delivery)
 * @returns ETA in minutes
 */
export const calculateETA = (distance: number, averageSpeed: number = 30): number => {
  // Time = Distance / Speed
  // Convert hours to minutes
  return Math.round((distance / averageSpeed) * 60);
};

/**
 * Formats minutes into a human-readable string
 * @param minutes Number of minutes
 * @returns Formatted string (e.g., "15 minutes", "1 hour 30 minutes")
 */
export const formatETATime = (minutes: number): string => {
  if (minutes < 1) {
    return 'Less than a minute';
  }
  
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
};