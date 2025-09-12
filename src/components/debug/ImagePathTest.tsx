import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const ImagePathTest = () => {
  // Test different ways of loading images
  const testImages = [
    {
      name: 'Direct require 1',
      source: require('../../assets/category/1.png'),
    },
    {
      name: 'Direct require 2', 
      source: require('../../assets/category/2.png'),
    },
    {
      name: 'Direct require 3',
      source: require('../../assets/category/3.png'),
    },
    {
      name: 'Direct require 4',
      source: require('../../assets/category/4.png'),
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Image Path Test</Text>
      <View style={styles.grid}>
        {testImages.map((testImage, index) => (
          <View key={index} style={styles.item}>
            <View style={styles.imageContainer}>
              <Image 
                source={testImage.source}
                style={styles.image}
                onError={(error) => {
                  console.log('Error loading', testImage.name, ':', error.nativeEvent.error);
                }}
                onLoad={() => {
                  console.log('Successfully loaded:', testImage.name);
                }}
              />
            </View>
            <Text style={styles.text}>{testImage.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  item: {
    width: '45%',
    marginBottom: 20,
    alignItems: 'center',
  },
  imageContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#E5F3F3',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    padding: 10,
  },
  image: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  text: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },
});

export default ImagePathTest;
