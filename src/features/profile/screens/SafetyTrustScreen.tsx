import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import CustomHeader from '@components/ui/CustomHeader';
import CustomText from '@components/ui/CustomText';
import { Fonts, Colors } from '@utils/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import { RFValue } from 'react-native-responsive-fontsize';

const SafetyTrustScreen = () => {
    const safetySections = [
        {
            title: "Quality & Hygiene",
            icon: "ribbon-outline",
            items: [
                {
                    subtitle: "Verified Sources",
                    description: "All our meat is sourced from FSSAI-registered farms and certified sellers to ensure the highest quality standards."
                },
                {
                    subtitle: "Veterinary Checks",
                    description: "Every goat undergoes mandatory health checks by qualified veterinarians before being listed on our platform."
                },
                {
                    subtitle: "Freshness Guarantee",
                    description: "We guarantee 100% fresh meat delivered to your doorstep. We strictly prohibit frozen or old stock."
                }
            ]
        },
        {
            title: "Delivery Partner Safety",
            icon: "bicycle-outline",
            items: [
                {
                    subtitle: "Insured Rides",
                    description: "We care for those who deliver to you. All our delivery partners are covered under comprehensive accidental insurance."
                },
                {
                    subtitle: "Safety First Policy",
                    description: "We prioritize safe driving over speed. Our partners are not penalized for late deliveries caused by traffic or bad weather."
                },
                {
                    subtitle: "Emergency Support",
                    description: "A dedicated 24/7 helpline is available for our delivery partners to handle any on-road emergencies immediately."
                }
            ]
        },
        {
            title: "Data & Privacy",
            icon: "shield-checkmark-outline",
            items: [
                {
                    subtitle: "Number Masking",
                    description: "Your phone number is masked when you contact delivery partners, ensuring your personal contact details remain private."
                },
                {
                    subtitle: "Secure Payments",
                    description: "All transactions are 100% secure and encrypted, fully compliant with RBI guidelines for digital payments."
                }
            ]
        },
        {
            title: "Grievance Redressal",
            icon: "document-text-outline",
            items: [
                {
                    subtitle: "Grievance Officer",
                    description: "In accordance with the Information Technology Act, 2000 and rules made there under, the name and contact details of the Grievance Officer are provided below:"
                },
                {
                    subtitle: "Contact Details",
                    description: "Mr. Amit Kumar\nDesignation: Grievance Officer\nEmail: grievance@goatgoat.in\nAddress: GoatGoat HQ, Tech Park, Bangalore, Karnataka - 560103"
                }
            ]
        }
    ];

    return (
        <View style={styles.container}>
            <CustomHeader title="Safety & Trust" />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.introContainer}>
                    <CustomText variant="h5" fontFamily={Fonts.SemiBold} style={styles.mainTitle}>
                        Your Safety, Our Priority
                    </CustomText>
                    <CustomText variant="h7" fontFamily={Fonts.Regular} style={styles.mainSubtitle}>
                        We are committed to maintaining the highest standards of safety, hygiene, and trust for our community.
                    </CustomText>
                </View>

                {safetySections.map((section, index) => (
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

export default SafetyTrustScreen;
