import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import React, {FC, useEffect, useState} from 'react';
import {Colors} from '@utils/Constants';
import {screenHeight} from '@utils/Scaling';
import {useMapRefStore} from '@state/mapStore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {handleFitToPath} from '@components/map/mapUtils';
import {RFValue} from 'react-native-responsive-fontsize';
import MapViewComponent from '@components/map/MapViewComponent';

interface LiveMapProps {
  deliveryPersonLocation: any;
  pickupLocation: any;
  deliveryLocation: any;
  hasPickedUp: any;
  hasAccepted: any;
}

const LiveMap: FC<LiveMapProps> = ({
  deliveryLocation,
  deliveryPersonLocation,
  hasAccepted,
  hasPickedUp,
  pickupLocation,
}) => {
  const {mapRef, setMapRef} = useMapRefStore();
  const [camera, setCamera] = useState<any>(null);

  // Reduce logging in production to prevent debugger issues
  useEffect(() => {
    if (__DEV__) {
      console.log('📍 LiveMap mounted');
    }
  }, []);

  useEffect(() => {
    // Update camera when delivery person location changes
    if (deliveryPersonLocation) {
      if (__DEV__) {
        console.log('📍 Updating camera with delivery person location');
      }
      setCamera({
        center: {
          latitude: deliveryPersonLocation.latitude,
          longitude: deliveryPersonLocation.longitude,
        },
        pitch: 0,
        heading: 0,
        altitude: 1000,
        zoom: 15,
      });
    }
  }, [deliveryPersonLocation]);

  // Remove the automatic call to handleFitToPath to prevent unintended debugger pauses
  // The function will only be called when the user explicitly presses the fit button

  return (
    <View style={styles.container}>
      <MapViewComponent
        mapRef={mapRef}
        setMapRef={setMapRef}
        camera={camera}
        hasAccepted={hasAccepted}
        deliveryLocation={deliveryLocation}
        pickupLocation={pickupLocation}
        deliveryPersonLocation={deliveryPersonLocation}
        hasPickedUp={hasPickedUp}
      />

      <TouchableOpacity
        style={styles.fitButton}
        onPress={() => {
          if (__DEV__) {
            console.log('📍 Fit to path button pressed');
          }
          handleFitToPath(
            mapRef,
            deliveryLocation,
            pickupLocation,
            hasPickedUp,
            hasAccepted,
            deliveryPersonLocation,
          );
        }}>
        <Icon name="target" size={RFValue(14)} color={Colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: screenHeight * 0.35,
    width: '100%',
    borderRadius: 15,
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  fitButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    padding: 5,
    backgroundColor: '#fff',
    borderWidth: 0.8,
    borderColor: Colors.border,
    shadowOffset: {width: 1, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowColor: 'black',
    elevation: 5,
    borderRadius: 35,
  },
});

export default LiveMap;