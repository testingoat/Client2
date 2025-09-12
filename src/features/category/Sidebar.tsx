import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import React, {FC, useEffect, useRef} from 'react';
import {Colors} from '@utils/Constants';
import CustomText from '@components/ui/CustomText';
import {RFValue} from 'react-native-responsive-fontsize';

interface SidebarProps {
  selectedCategory: any;
  categories: any;
  onCategoryPress: (category: any) => void;
}

const Sidebar: FC<SidebarProps> = ({
  selectedCategory,
  categories,
  onCategoryPress,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const indicatorPosition = useRef(new Animated.Value(0)).current;
  const animatedValues = categories?.map(() => useRef(new Animated.Value(0)).current);

  useEffect(() => {
    let targetIndex = -1;

    categories?.forEach((category: any, index: number) => {
      const isSelected = selectedCategory?._id === category?._id;
      Animated.timing(animatedValues[index], {
        toValue: isSelected ? 2 : -15,
        duration: 500,
        useNativeDriver: true,
      }).start();
      if (isSelected) targetIndex = index;
    });

    if (targetIndex !== -1) {
      Animated.timing(indicatorPosition, {
        toValue: targetIndex * 100,
        duration: 500,
        useNativeDriver: true,
      }).start();

      scrollViewRef.current?.scrollTo({
        y: targetIndex * 100,
        animated: true,
      });
    }
  }, [selectedCategory]);

  return (
    <View style={styles.sideBar}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{paddingBottom: 50}}
        showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.indicator,
            {
              transform: [{translateY: indicatorPosition}],
            }
          ]}
        />

        <View>
          {categories?.map((category: any, index: number) => {
            return (
              <TouchableOpacity
                key={index}
                activeOpacity={1}
                style={styles.categoryButton}
                onPress={() => onCategoryPress(category)}>
                <View
                  style={[
                    styles.imageContainer,
                    selectedCategory.id === category?._id &&
                      styles.selectedImageContainer,
                  ]}>
                  <Animated.Image
                    source={{uri: category?.image}}
                    style={[
                      styles.image,
                      {
                        transform: [{translateY: animatedValues[index]}],
                      }
                    ]}
                  />
                </View>

                <CustomText fontSize={RFValue(7)} style={{textAlign: 'center'}}>
                  {category?.name}
                </CustomText>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sideBar: {
    width: '24%',
    backgroundColor: '#fff',
    borderRightWidth: 0.8,
    borderRightColor: '#eee',
    position: 'relative',
  },
  categoryButton: {
    padding: 10,
    height: 100,
    paddingVertical: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },

  indicator: {
    position: 'absolute',
    right: 0,
    width: 4,
    height: 80,
    top: 10,
    alignSelf: 'center',
    backgroundColor: Colors.secondary,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
  },
  image: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  imageContainer: {
    borderRadius: 100,
    height: '50%',
    marginBottom: 10,
    width: '75%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F7',
    overflow: 'hidden',
  },
  selectedImageContainer: {
    backgroundColor: '#CFFFDB',
  },
});

export default Sidebar;
