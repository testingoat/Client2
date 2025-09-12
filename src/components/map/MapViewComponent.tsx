import React, {memo, useEffect} from 'react';
import MapView, {Polyline, Camera} from 'react-native-maps';
import {customMapStyle} from '@utils/CustomMap';
import Markers from './Markers';
import {getPoints} from '@utils/getPoints';
import {Colors} from '@utils/Constants';
import MapViewDirections from 'react-native-maps-directions';
import {GOOGLE_MAP_API} from '@service/config';

const MapViewComponent = ({
  mapRef,
  hasAccepted,
  setMapRef,
  camera,
  deliveryLocation,
  pickupLocation,
  deliveryPersonLocation,
  hasPickedUp,
}: {
  mapRef: any;
  hasAccepted: boolean;
  setMapRef: (ref: any) => void;
  camera: Camera | null;
  deliveryLocation: any;
  pickupLocation: any;
  deliveryPersonLocation: any;
  hasPickedUp: boolean;
}) => {
  // Update camera when it changes - only log in development
  useEffect(() => {
    if (mapRef && camera) {
      if (__DEV__) {
        console.log('📍 Animating camera');
      }
      mapRef.animateCamera(camera, {duration: 1000});
    }
  }, [mapRef, camera]);

  // Reduce logging in production to prevent debugger issues
  useEffect(() => {
    if (__DEV__) {
      console.log('📍 MapViewComponent rendered');
    }
  }, []);

  return (
    <MapView
      ref={setMapRef}
      style={{flex: 1}}
      provider="google"
      camera={camera}
      customMapStyle={customMapStyle}
      showsUserLocation={true}
      showsMyLocationButton={false}
      userLocationCalloutEnabled={true}
      userLocationPriority="high"
      showsTraffic={false}
      pitchEnabled={false}
      followsUserLocation={true}
      showsCompass={true}
      showsBuildings={false}
      showsIndoors={false}
      showsScale={false}
      showsIndoorLevelPicker={false}
      initialRegion={{
        latitude: deliveryPersonLocation?.latitude || 28.6139,
        longitude: deliveryPersonLocation?.longitude || 77.2090,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}>

      {deliveryPersonLocation && (hasPickedUp || hasAccepted) && (
        <MapViewDirections
          origin={deliveryPersonLocation}
          destination={hasAccepted ? pickupLocation : deliveryLocation}
          precision="high"
          apikey={GOOGLE_MAP_API}
          strokeColor="#2871F2"
          strokeColors={["#2871F2"]}
          strokeWidth={5}
          onError={err => {
            if (__DEV__) {
              console.log('📍 MapViewDirections error:', err);
            }
          }}
          onReady={result => {
            if (__DEV__) {
              console.log('📍 MapViewDirections ready');
            }
          }}
        />
      )}

      <Markers
        deliveryPersonLocation={deliveryPersonLocation}
        deliveryLocation={deliveryLocation}
        pickupLocation={pickupLocation}
      />

      {!hasPickedUp && deliveryLocation && pickupLocation && (
        <Polyline
          coordinates={getPoints([pickupLocation, deliveryLocation])}
          strokeColor={Colors.text}
          strokeWidth={2}
          geodesic={true}
          lineDashPattern={[12, 10]}
        />
      )}
    </MapView>
  );
};

export default memo(MapViewComponent);