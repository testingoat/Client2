import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import CustomHeader from '@components/ui/CustomHeader';
import CustomText from '@components/ui/CustomText';
import { Fonts, Colors } from '@utils/Constants';
import Icon from 'react-native-vector-icons/Ionicons';

const SupportScreen = () => {
    const SUPPORT_PHONE = '+91 84319 89263';
    const SUPPORT_EMAIL = 'support@goatgoat.in';

    const handleCall = () => {
        const phoneUrl = `tel:${SUPPORT_PHONE.replace(/\s/g, '')}`;
        Linking.canOpenURL(phoneUrl)
            .then((supported) => {
                if (supported) {
                    Linking.openURL(phoneUrl);
                } else {
                    Alert.alert('Error', 'Unable to make phone call');
                }
            })
            .catch(() => Alert.alert('Error', 'Unable to make phone call'));
    };

    const handleEmail = () => {
        const emailUrl = `mailto:${SUPPORT_EMAIL}?subject=Support%20Request`;
        Linking.canOpenURL(emailUrl)
            .then((supported) => {
                if (supported) {
                    Linking.openURL(emailUrl);
                } else {
                    Alert.alert('Error', 'Unable to open email app');
                }
            })
            .catch(() => Alert.alert('Error', 'Unable to open email app'));
    };

    const handleWhatsApp = () => {
        const whatsappUrl = `whatsapp://send?phone=91${SUPPORT_PHONE.replace(/\D/g, '').slice(-10)}`;
        Linking.canOpenURL(whatsappUrl)
            .then((supported) => {
                if (supported) {
                    Linking.openURL(whatsappUrl);
                } else {
                    Alert.alert('WhatsApp Not Installed', 'Please install WhatsApp to use this feature');
                }
            })
            .catch(() => Alert.alert('Error', 'Unable to open WhatsApp'));
    };

    const supportOptions = [
        {
            icon: 'call-outline',
            title: 'Call Us',
            subtitle: 'Speak with our support team',
            value: SUPPORT_PHONE,
            action: handleCall,
            color: '#10b981',
        },
        {
            icon: 'logo-whatsapp',
            title: 'WhatsApp',
            subtitle: 'Quick chat support',
            value: 'Chat with us',
            action: handleWhatsApp,
            color: '#25D366',
        },
        {
            icon: 'mail-outline',
            title: 'Email',
            subtitle: 'For detailed inquiries',
            value: SUPPORT_EMAIL,
            action: handleEmail,
            color: '#3b82f6',
        },
    ];

    const workingHours = [
        { day: 'Monday - Friday', time: '9:00 AM - 9:00 PM' },
        { day: 'Saturday - Sunday', time: '10:00 AM - 6:00 PM' },
    ];

    return (
        <View style={styles.container}>
            <CustomHeader title="Support" />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <View style={styles.heroIconContainer}>
                        <Icon name="headset" size={48} color={Colors.secondary} />
                    </View>
                    <CustomText variant="h4" fontFamily={Fonts.Bold} style={styles.heroTitle}>
                        We're Here to Help
                    </CustomText>
                    <CustomText variant="h7" fontFamily={Fonts.Regular} style={styles.heroSubtitle}>
                        Our dedicated support team is available to assist you with any questions, concerns, or issues you may have.
                    </CustomText>
                </View>

                {/* Contact Options */}
                <CustomText variant="h6" fontFamily={Fonts.SemiBold} style={styles.sectionTitle}>
                    Contact Us
                </CustomText>

                {supportOptions.map((option, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.contactCard}
                        onPress={option.action}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconBox, { backgroundColor: `${option.color}15` }]}>
                            <Icon name={option.icon} size={24} color={option.color} />
                        </View>
                        <View style={styles.contactInfo}>
                            <CustomText variant="h7" fontFamily={Fonts.SemiBold}>
                                {option.title}
                            </CustomText>
                            <CustomText variant="h9" style={styles.subtitleText}>
                                {option.subtitle}
                            </CustomText>
                            <CustomText variant="h8" fontFamily={Fonts.Medium} style={{ color: option.color }}>
                                {option.value}
                            </CustomText>
                        </View>
                        <Icon name="chevron-forward" size={20} color={Colors.disabled} />
                    </TouchableOpacity>
                ))}

                {/* Working Hours */}
                <View style={styles.hoursCard}>
                    <View style={styles.hoursHeader}>
                        <Icon name="time-outline" size={20} color={Colors.secondary} />
                        <CustomText variant="h7" fontFamily={Fonts.SemiBold} style={styles.hoursTitle}>
                            Working Hours
                        </CustomText>
                    </View>
                    {workingHours.map((schedule, index) => (
                        <View key={index} style={styles.hoursRow}>
                            <CustomText variant="h8" fontFamily={Fonts.Medium}>
                                {schedule.day}
                            </CustomText>
                            <CustomText variant="h8" style={styles.timeText}>
                                {schedule.time}
                            </CustomText>
                        </View>
                    ))}
                </View>

                {/* Additional Info */}
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Icon name="flash-outline" size={18} color={Colors.secondary} />
                        <CustomText variant="h8" style={styles.infoText}>
                            Average response time: Under 2 hours
                        </CustomText>
                    </View>
                    <View style={styles.infoRow}>
                        <Icon name="shield-checkmark-outline" size={18} color={Colors.secondary} />
                        <CustomText variant="h8" style={styles.infoText}>
                            100% secure & confidential
                        </CustomText>
                    </View>
                    <View style={styles.infoRow}>
                        <Icon name="language-outline" size={18} color={Colors.secondary} />
                        <CustomText variant="h8" style={styles.infoText}>
                            Support available in English & Hindi
                        </CustomText>
                    </View>
                </View>

                {/* Emergency Notice */}
                <View style={styles.emergencyCard}>
                    <Icon name="alert-circle" size={20} color="#dc2626" />
                    <View style={styles.emergencyTextContainer}>
                        <CustomText variant="h8" fontFamily={Fonts.SemiBold} style={styles.emergencyTitle}>
                            Having an urgent issue with your order?
                        </CustomText>
                        <CustomText variant="h9" style={styles.emergencySubtitle}>
                            Call us directly for immediate assistance with live orders.
                        </CustomText>
                    </View>
                </View>

                <View style={styles.footerSpacer} />
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
        padding: 20,
    },
    heroSection: {
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
    },
    heroIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: `${Colors.secondary}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    heroTitle: {
        color: Colors.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    heroSubtitle: {
        color: Colors.text,
        opacity: 0.7,
        textAlign: 'center',
        lineHeight: 22,
    },
    sectionTitle: {
        color: Colors.text,
        marginBottom: 12,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    contactInfo: {
        flex: 1,
    },
    subtitleText: {
        color: Colors.text,
        opacity: 0.6,
        marginVertical: 2,
    },
    hoursCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginTop: 12,
        marginBottom: 16,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    hoursHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    hoursTitle: {
        color: Colors.text,
    },
    hoursRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.backgroundSecondary,
    },
    timeText: {
        color: Colors.secondary,
    },
    infoCard: {
        backgroundColor: `${Colors.secondary}10`,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    infoText: {
        color: Colors.text,
        flex: 1,
    },
    emergencyCard: {
        flexDirection: 'row',
        backgroundColor: '#fef2f2',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#fecaca',
        gap: 12,
    },
    emergencyTextContainer: {
        flex: 1,
    },
    emergencyTitle: {
        color: '#dc2626',
    },
    emergencySubtitle: {
        color: '#991b1b',
        marginTop: 2,
    },
    footerSpacer: {
        height: 40,
    },
});

export default SupportScreen;
