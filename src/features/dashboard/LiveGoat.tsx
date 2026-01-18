import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Share, ScrollView } from 'react-native';
import LottieView from 'lottie-react-native';
import { Colors, Fonts } from '@utils/Constants';
import CustomHeader from '@components/ui/CustomHeader';
import { RFValue } from 'react-native-responsive-fontsize';
import CustomText from '@components/ui/CustomText';
import { useNavigation } from '@react-navigation/native';

const LiveGoat = () => {
    const navigation = useNavigation();
    const [interestShown, setInterestShown] = useState(false);
    const animationRef = useRef<LottieView>(null);

    const handleShowInterest = () => {
        setInterestShown(true);
        // Play animation
        setTimeout(() => {
            animationRef.current?.play();
        }, 100);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: 'I just showed interest in the new Live Goat feature on the Goat app! 🐐 Coming Q1 2026!',
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleFAQ = () => {
        navigation.navigate('FAQScreen');
    };

    return (
        <View style={styles.container}>
            <CustomHeader title="Live Goat - Coming Soon" hideBack />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Image
                            source={require('@assets/images/Goat_sellers_rounded.png')}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    </View>

                    <CustomText variant="h3" fontFamily={Fonts.Bold} style={styles.title}>
                        Coming Soon!
                    </CustomText>

                    <CustomText variant="h6" fontFamily={Fonts.Medium} style={styles.subtitle}>
                        We are working hard to bring you the Live Goat tracking feature. Stay tuned!
                    </CustomText>

                    <CustomText variant="h7" fontFamily={Fonts.SemiBold} style={styles.launchDate}>
                        Launching Q1 2026 🚀
                    </CustomText>

                    <View style={styles.actionContainer}>
                        {interestShown ? (
                            <View style={styles.successContainer}>
                                <LottieView
                                    ref={animationRef}
                                    source={require('@assets/animations/confirm.json')}
                                    autoPlay
                                    loop={false}
                                    style={styles.lottie}
                                />
                                <CustomText variant="h5" fontFamily={Fonts.SemiBold} style={styles.successText}>
                                    Interest Received!
                                </CustomText>
                                <CustomText variant="h8" fontFamily={Fonts.Regular} style={styles.successSubText}>
                                    We'll notify you when it's ready.
                                </CustomText>

                                <TouchableOpacity
                                    style={styles.shareButton}
                                    onPress={handleShare}
                                    activeOpacity={0.8}
                                >
                                    <CustomText variant="h7" fontFamily={Fonts.Bold} style={styles.shareButtonText}>
                                        Tell a friend! 🗣️
                                    </CustomText>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleShowInterest}
                                activeOpacity={0.8}
                            >
                                <CustomText variant="h6" fontFamily={Fonts.Bold} style={styles.buttonText}>
                                    Show Interest 🚀
                                </CustomText>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <TouchableOpacity style={styles.faqContainer} onPress={handleFAQ}>
                    <CustomText variant="h7" fontFamily={Fonts.Medium} style={styles.faqText}>
                        Have questions? Read our FAQ
                    </CustomText>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundSecondary,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'space-between',
        paddingBottom: 20,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    iconContainer: {
        marginBottom: 20,
        // Removed heavy shadow and background for a cleaner look as requested
        // If the image is already rounded and good looking, it might not need a container background
        padding: 10,
    },
    image: {
        width: 140, // Slightly larger
        height: 140,
    },
    title: {
        color: Colors.text,
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        color: Colors.text,
        textAlign: 'center',
        opacity: 0.7,
        marginBottom: 20,
        lineHeight: 24,
    },
    launchDate: {
        color: Colors.secondary,
        marginBottom: 30,
        textAlign: 'center',
    },
    actionContainer: {
        minHeight: 150,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        backgroundColor: Colors.secondary,
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
    },
    buttonText: {
        color: 'white',
    },
    successContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    lottie: {
        width: 100,
        height: 100,
    },
    successText: {
        color: Colors.secondary,
        marginTop: 10,
    },
    successSubText: {
        color: Colors.text,
        opacity: 0.6,
        marginTop: 5,
        marginBottom: 20,
    },
    shareButton: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: Colors.secondary,
        marginTop: 10,
    },
    shareButtonText: {
        color: Colors.secondary,
    },
    faqContainer: {
        padding: 20,
        alignItems: 'center',
    },
    faqText: {
        color: Colors.disabled,
        textDecorationLine: 'underline',
    },
});

export default LiveGoat;
