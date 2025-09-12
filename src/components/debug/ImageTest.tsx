import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

const ImageTest = () => {
  // Test loading the first category image
  const testImage = require('../../assets/category/1.png');
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Image Loading Test</Text>
      <View style={styles.imageContainer}>
        <Image 
          source={testImage} 
          style={styles.image}
          onError={(error) => {
            console.log('Test Image Error:', error.nativeEvent.error);
          }}
          onLoad={() => {
            console.log('Test Image Loaded Successfully');
          }}
        />
      </View>
      <Text style={styles.text}>Category Image Test</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  imageContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#E5F3F3',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  image: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  text: {
    marginTop: 10,
    textAlign: 'center',
  },
});

export default ImageTest;
