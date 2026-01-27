import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import CustomHeader from '@components/ui/CustomHeader';
import CustomText from '@components/ui/CustomText';
import { Fonts, Colors } from '@utils/Constants';
import Icon from 'react-native-vector-icons/Ionicons';

const TermsScreen = () => {
    const termsSections = [
        {
            title: "Introduction",
            icon: "information-circle-outline",
            items: [
                {
                    subtitle: "Agreement to Terms",
                    description: "By accessing or using the GoatGoat platform, you agree to be bound by these Terms of Service. This document is an electronic record in terms of the Information Technology Act, 2000."
                }
            ]
        },
        {
            title: "Eligibility",
            icon: "person-outline",
            items: [
                {
                    subtitle: "Age Requirement",
                    description: "You must be at least 18 years of age to use our services. If you are under 18, you may use the platform only under the supervision of a parent or legal guardian."
                }
            ]
        },
        {
            title: "Account & Security",
            icon: "lock-closed-outline",
            items: [
                {
                    subtitle: "User Responsibility",
                    description: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account."
                }
            ]
        },
        {
            title: "Orders & Payments",
            icon: "card-outline",
            items: [
                {
                    subtitle: "Contract of Sale",
                    description: "The contract for the sale of goods is strictly bipartite between you and the merchant. GoatGoat acts only as an intermediary."
                },
                {
                    subtitle: "Pricing",
                    description: "All prices are listed in Indian Rupees (INR) and are subject to change by the merchant at any time without prior notice."
                }
            ]
        },
        {
            title: "Delivery",
            icon: "bicycle-outline",
            items: [
                {
                    subtitle: "Independent Partners",
                    description: "Delivery services are provided by independent third-party delivery partners. Delivery times are estimates and may vary due to traffic or weather conditions."
                }
            ]
        },
        {
            title: "User Conduct",
            icon: "alert-circle-outline",
            items: [
                {
                    subtitle: "Lawful Use",
                    description: "You agree to use the platform only for lawful purposes and not to violate any applicable laws or regulations."
                }
            ]
        },
        {
            title: "Governing Law",
            icon: "document-text-outline",
            items: [
                {
                    subtitle: "Jurisdiction",
                    description: "These terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka."
                }
            ]
        }
    ];

    return (
        <View style={styles.container}>
            <CustomHeader title="Terms of Service" />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.introContainer}>
                    <CustomText variant="h5" fontFamily={Fonts.SemiBold} style={styles.mainTitle}>
                        Terms of Use
                    </CustomText>
                    <CustomText variant="h7" fontFamily={Fonts.Regular} style={styles.mainSubtitle}>
                        Please read these terms carefully before using our services.
                    </CustomText>
                </View>

                {termsSections.map((section, index) => (
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

export default TermsScreen;
