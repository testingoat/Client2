import {View, Text} from 'react-native';
import React from 'react';
import {Marker} from 'react-native-maps';

const Markers = ({
  deliveryLocation,
  pickupLocation,
  deliveryPersonLocation,
}: any) => {
  // Helper function to check if location is valid
  const isValidLocation = (location: any) => {
    return location && 
           typeof location.latitude === 'number' && 
           typeof location.longitude === 'number' &&
           !isNaN(location.latitude) && 
           !isNaN(location.longitude);
  };

  return (
    <>
      {isValidLocation(deliveryLocation) && (
        <Marker
          zIndex={11}
          image={require('@assets/icons/my_pin.png')}
          coordinate={deliveryLocation}
          style={{height: 20, width: 20}}
        />
      )}

      {isValidLocation(pickupLocation) && (
        <Marker
          image={require('@assets/icons/store.png')}
          coordinate={pickupLocation}
          zIndex={22}
          style={{height: 20, width: 20}}
        />
      )}

      {isValidLocation(deliveryPersonLocation) && (
        <Marker
          image={require('@assets/icons/delivery.png')}
          coordinate={deliveryPersonLocation}
          zIndex={99}
          style={{
            position: 'absolute',
            zIndex: 99,
            height: 20,
            width: 20,
          }}
        />
      )}
    </>
  );
};

export default Markers;