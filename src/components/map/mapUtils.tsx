export const handleFitToPath = (
    mapRef: any,
    deliveryLocation: any,
    pickupLocation: any,
    hasPickedUp: any,
    hasAccepted: any,
    deliveryPersonLocation: any,
) => {
    // Only log in development mode to prevent debugger pauses
    if (__DEV__) {
        console.log('📍 handleFitToPath called');
    }

    // Validate that we have all required data before proceeding
    if (!mapRef || !deliveryLocation || !pickupLocation) {
        if (__DEV__) {
            console.log('📍 Skipping fitToCoordinates due to missing data');
        }
        return;
    }

    // Validate location objects have required properties
    const isValidLocation = (location: any) => {
        return location && 
               typeof location.latitude === 'number' && 
               typeof location.longitude === 'number' &&
               !isNaN(location.latitude) && 
               !isNaN(location.longitude);
    };

    // Determine which coordinates to use based on the delivery status
    let origin, destination;
    
    if (hasAccepted && isValidLocation(deliveryPersonLocation)) {
        origin = deliveryPersonLocation;
    } else if (isValidLocation(deliveryLocation)) {
        origin = deliveryLocation;
    }
    
    if (hasPickedUp && isValidLocation(deliveryPersonLocation)) {
        destination = deliveryPersonLocation;
    } else if (isValidLocation(pickupLocation)) {
        destination = pickupLocation;
    }

    // Only proceed if we have valid origin and destination
    if (!origin || !destination) {
        if (__DEV__) {
            console.log('📍 Skipping fitToCoordinates due to invalid locations');
        }
        return;
    }

    const coordinates = [origin, destination];
    
    if (__DEV__) {
        console.log('📍 Fitting map to coordinates');
    }
    
    try {
        mapRef.fitToCoordinates(coordinates, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true
        });
    } catch (error) {
        if (__DEV__) {
            console.log('📍 Error in fitToCoordinates:', error);
        }
    }
};