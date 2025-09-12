import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, FlatList } from 'react-native';
import { categories } from '@utils/dummyData';

const { width: screenWidth } = Dimensions.get('window');

const SimpleCategoryTest = () => {
  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.item}>
      <View style={styles.imageContainer}>
        <Image 
          source={item.image} 
          style={styles.image}
          onError={(error) => {
            console.log('Image Error for', item.name, ':', error.nativeEvent.error);
          }}
          onLoad={() => {
            console.log('Image Loaded:', item.name);
          }}
        />
      </View>
      <Text style={styles.text} numberOfLines={2}>
        {item.name}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple Category Test</Text>
      <FlatList
        data={categories}
        renderItem={renderItem}
        numColumns={4}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
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
  listContainer: {
    paddingHorizontal: 10,
  },
  item: {
    width: (screenWidth - 60) / 4,
    marginHorizontal: 5,
    marginVertical: 10,
    alignItems: 'center',
  },
  imageContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#E5F3F3',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    padding: 5,
  },
  image: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  text: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },
});

export default SimpleCategoryTest;
