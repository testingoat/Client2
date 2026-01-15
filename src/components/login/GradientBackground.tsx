import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const GradientBackground = () => {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#10b981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.topSection}
            />
            <View style={styles.bottomSection} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: width,
        height: height,
        zIndex: -10,
    },
    topSection: {
        width: '100%',
        height: '45%',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    bottomSection: {
        width: '100%',
        height: '55%',
        backgroundColor: '#f8f9fc',
    },
});

export default GradientBackground;
