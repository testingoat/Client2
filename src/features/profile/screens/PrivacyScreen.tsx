import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import CustomHeader from '@components/ui/CustomHeader';
import CustomText from '@components/ui/CustomText';
import { Fonts, Colors } from '@utils/Constants';
import Icon from 'react-native-vector-icons/Ionicons';

const PrivacyScreen = () => {
    const privacySections = [
        {
            title: "Information Collection",
            icon: "cloud-download-outline",
            items: [
                {
                    subtitle: "Personal Information",
                    description: "We collect information you provide directly, such as your name, phone number, email address, and delivery location."
                },
                {
                    subtitle: "Usage Data",
                    description: "We automatically collect data about your usage of the app, including order history and device information, to improve our services."
                }
            ]
        },
        {
            title: "Use of Information",
            icon: "construct-outline",
            items: [
                {
                    subtitle: "Service Fulfillment",
                    description: "We use your data to process orders, facilitate delivery, and provide customer support."
                },
                {
                    subtitle: "Marketing",
                    description: "With your consent, we may use your contact details to send you promotional offers and updates."
                }
            ]
        },
        {
            title: "Data Sharing",
            icon: "share-social-outline",
            items: [
                {
                    subtitle: "Service Providers",
                    description: "We share necessary details with restaurants (for order preparation) and delivery partners (for order delivery)."
                },
                {
                    subtitle: "Legal Requirements",
                    description: "We may disclose information if required by law or to protect our rights and safety."
                }
            ]
        },
        {
            title: "Data Security",
            icon: "shield-checkmark-outline",
            items: [
                {
                    subtitle: "Protection Measures",
                    description: "We implement robust security measures, including encryption, to protect your personal data."
                },
                {
                    subtitle: "Secure Payments",
                    description: "All payment processing is handled by PCI-compliant payment gateways."
                }
            ]
        },
        {
            title: "User Rights",
            icon: "accessibility-outline",
            items: [
                {
                    subtitle: "Your Controls",
                    description: "You have the right to access, correct, or request deletion of your personal data in accordance with the Digital Personal Data Protection Act, 2023."
                }
            ]
        },
        {
            title: "Grievance Redressal",
            icon: "person-circle-outline",
            items: [
                {
                    subtitle: "Contact Us",
                    description: "For any privacy-related concerns or grievances, please contact our Grievance Officer:"
                },
                {
                    subtitle: "Details",
                    description: "Mr. Amit Kumar\nEmail: privacy@goatgoat.in\nAddress: GoatGoat HQ, Tech Park, Bangalore, Karnataka - 560103"
                }
            ]
        }
    ];

    return (
        <View style={styles.container}>
            <CustomHeader title="Privacy Policy" />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.introContainer}>
                    <CustomText variant="h5" fontFamily={Fonts.SemiBold} style={styles.mainTitle}>
                        Your Privacy Matters
                    </CustomText>
                    <CustomText variant="h7" fontFamily={Fonts.Regular} style={styles.mainSubtitle}>
                        We are committed to protecting your personal information and your right to privacy.
                    </CustomText>
                </View>

                {privacySections.map((section, index) => (
                    <View key={index} style={styles.sectionCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.iconContainer}>
                                <Icon name={section.icon} size={20} color={Colors.primary} />
                            </View>
                            <CustomText variant="h6" fontFamily={Fonts.Bold} style={styles.cardTitle}>
                                {section.title}
                            </CustomText>
                        </View>

                        {section.items.map((item, idx) => (
                            <View key={idx} style={styles.itemContainer}>
                                <CustomText variant="h7" fontFamily={Fonts.SemiBold} style={styles.itemSubtitle}>
                                    {item.subtitle}
                                </CustomText>
                                <CustomText variant="h8" fontFamily={Fonts.Regular} style={styles.itemDescription}>
                                    {item.description}
                                </CustomText>
                            </View>
                        ))}
                    </View>
                ))}

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
    introContainer: {
        marginBottom: 20,
    },
    mainTitle: {
        color: Colors.text,
        marginBottom: 5,
    },
    mainSubtitle: {
        color: Colors.text,
        opacity: 0.7,
        lineHeight: 20,
    },
    sectionCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.backgroundSecondary,
        paddingBottom: 10,
    },
    iconContainer: {
        backgroundColor: Colors.backgroundSecondary,
        padding: 8,
        borderRadius: 8,
        marginRight: 10,
    },
    cardTitle: {
        color: Colors.text,
    },
    itemContainer: {
        marginBottom: 15,
    },
    itemSubtitle: {
        color: Colors.text,
        marginBottom: 4,
    },
    itemDescription: {
        color: Colors.text,
        opacity: 0.7,
        lineHeight: 18,
    },
    footerSpacer: {
        height: 20,
    }
});

export default PrivacyScreen;
