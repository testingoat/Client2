import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import CustomHeader from '@components/ui/CustomHeader';
import CustomText from '@components/ui/CustomText';
import { Fonts, Colors } from '@utils/Constants';
import Icon from 'react-native-vector-icons/Ionicons';

const CancellationPolicyScreen = () => {
    const policySections = [
        {
            title: "Cancellation Policy",
            icon: "close-circle-outline",
            items: [
                {
                    subtitle: "User Cancellation",
                    description: "You may cancel your order within 60 seconds of placing it for a full refund. Cancellations after this window or after restaurant acceptance may attract a cancellation fee up to 100% of the order value."
                },
                {
                    subtitle: "Platform Cancellation",
                    description: "We reserve the right to cancel orders due to unavailability of items, delivery partner issues, or if the user is unreachable."
                }
            ]
        },
        {
            title: "Refund Eligibility",
            icon: "cash-outline",
            items: [
                {
                    subtitle: "Incorrect or Missing Items",
                    description: "You are eligible for a refund if the delivered order is incorrect or has missing items."
                },
                {
                    subtitle: "Quality Issues",
                    description: "Refunds will be issued for orders with quality issues such as spoilage, foreign objects, or damaged packaging."
                },
                {
                    subtitle: "Delivery Delays",
                    description: "Significant delivery delays attributable to us may be eligible for compensation or refund on a case-by-case basis."
                }
            ]
        },
        {
            title: "Refund Process",
            icon: "refresh-circle-outline",
            items: [
                {
                    subtitle: "Reporting",
                    description: "Please report any issues via the 'Help' section within 30 minutes of delivery. You may be asked to provide photographic evidence."
                },
                {
                    subtitle: "Processing Time",
                    description: "Approved refunds are processed to the original payment method. UPI refunds typically take 24-48 hours, while card refunds may take 5-7 business days."
                }
            ]
        }
    ];

    return (
        <View style={styles.container}>
            <CustomHeader title="Cancellation & Refund" />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.introContainer}>
                    <CustomText variant="h5" fontFamily={Fonts.SemiBold} style={styles.mainTitle}>
                        Cancellation & Refund Policy
                    </CustomText>
                    <CustomText variant="h7" fontFamily={Fonts.Regular} style={styles.mainSubtitle}>
                        Transparent policies for a hassle-free experience.
                    </CustomText>
                </View>

                {policySections.map((section, index) => (
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

export default CancellationPolicyScreen;
