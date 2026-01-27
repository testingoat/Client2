import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import CustomHeader from '@components/ui/CustomHeader';
import CustomText from '@components/ui/CustomText';
import { Fonts, Colors } from '@utils/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQSection {
    title: string;
    icon: string;
    faqs: FAQItem[];
}

const FAQAccordion = ({ faq, index }: { faq: FAQItem; index: number }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <TouchableOpacity
            style={styles.faqItem}
            onPress={() => setExpanded(!expanded)}
            activeOpacity={0.7}
        >
            <View style={styles.faqHeader}>
                <CustomText variant="h8" fontFamily={Fonts.Medium} style={styles.faqQuestion}>
                    {faq.question}
                </CustomText>
                <Icon
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={Colors.disabled}
                />
            </View>
            {expanded && (
                <CustomText variant="h9" style={styles.faqAnswer}>
                    {faq.answer}
                </CustomText>
            )}
        </TouchableOpacity>
    );
};

const HelpCenterScreen = () => {
    const navigation = useNavigation();

    const faqSections: FAQSection[] = [
        {
            title: 'Orders & Delivery',
            icon: 'bicycle-outline',
            faqs: [
                {
                    question: 'How do I track my order?',
                    answer: 'You can track your order in real-time from the Orders section. Once your order is confirmed, you\'ll see the delivery partner\'s live location and estimated time of arrival.'
                },
                {
                    question: 'What are the delivery hours?',
                    answer: 'We deliver between 8:00 AM and 10:00 PM daily. Orders placed after 10:00 PM will be scheduled for the next day.'
                },
                {
                    question: 'How long does delivery take?',
                    answer: 'Standard delivery takes 30-60 minutes depending on your location and order size. During peak hours or bad weather, it may take slightly longer.'
                },
                {
                    question: 'Can I change my delivery address after placing an order?',
                    answer: 'You can modify your delivery address within 60 seconds of placing the order. After that, please contact our support team for assistance.'
                },
            ]
        },
        {
            title: 'Payments & Refunds',
            icon: 'card-outline',
            faqs: [
                {
                    question: 'What payment methods are accepted?',
                    answer: 'We accept UPI, credit/debit cards, net banking, and wallet payments. Cash on Delivery (COD) is also available for orders up to ₹2,000.'
                },
                {
                    question: 'How do I get a refund?',
                    answer: 'If you\'re eligible for a refund, it will be processed to your original payment method within 5-7 business days. Wallet refunds are instant.'
                },
                {
                    question: 'Why was my payment declined?',
                    answer: 'Payments may be declined due to insufficient funds, incorrect card details, or bank security measures. Please try again or use a different payment method.'
                },
            ]
        },
        {
            title: 'Product Quality',
            icon: 'ribbon-outline',
            faqs: [
                {
                    question: 'How do you ensure freshness?',
                    answer: 'All our products are sourced fresh daily from certified suppliers. We maintain strict cold-chain logistics to ensure products reach you in optimal condition.'
                },
                {
                    question: 'What if I receive a damaged or wrong item?',
                    answer: 'Please report the issue immediately through the Help section in your order. Share photos of the issue, and we\'ll arrange for a refund or replacement.'
                },
                {
                    question: 'Are your products halal certified?',
                    answer: 'Yes, all our meat products are 100% halal certified from FSSAI-approved sources.'
                },
            ]
        },
        {
            title: 'Account & App',
            icon: 'person-outline',
            faqs: [
                {
                    question: 'How do I update my phone number?',
                    answer: 'Go to Profile > Your Account > Edit Profile to update your phone number. You\'ll need to verify the new number via OTP.'
                },
                {
                    question: 'How do I delete my account?',
                    answer: 'To delete your account, please contact our support team. Your personal data will be removed in accordance with our privacy policy.'
                },
                {
                    question: 'How do I use a coupon code?',
                    answer: 'During checkout, tap on "Use Coupons" to view available coupons. Select or enter a code to apply the discount to your order.'
                },
            ]
        },
    ];

    const quickLinks = [
        { icon: 'headset-outline', label: 'Contact Support', screen: 'SupportScreen', color: '#10b981' },
        { icon: 'shield-checkmark-outline', label: 'Safety & Trust', screen: 'SafetyTrustScreen', color: '#3b82f6' },
        { icon: 'document-text-outline', label: 'Terms of Service', screen: 'TermsScreen', color: '#8b5cf6' },
    ];

    return (
        <View style={styles.container}>
            <CustomHeader title="Help Center" />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Search-like Header */}
                <View style={styles.headerSection}>
                    <CustomText variant="h4" fontFamily={Fonts.Bold} style={styles.headerTitle}>
                        How can we help you?
                    </CustomText>
                    <CustomText variant="h8" style={styles.headerSubtitle}>
                        Find answers to common questions below or contact our support team.
                    </CustomText>
                </View>

                {/* Quick Links */}
                <View style={styles.quickLinksContainer}>
                    {quickLinks.map((link, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.quickLinkCard}
                            onPress={() => navigation.navigate(link.screen as never)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.quickLinkIcon, { backgroundColor: `${link.color}15` }]}>
                                <Icon name={link.icon} size={22} color={link.color} />
                            </View>
                            <CustomText variant="h9" fontFamily={Fonts.Medium} style={styles.quickLinkLabel}>
                                {link.label}
                            </CustomText>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* FAQ Sections */}
                <CustomText variant="h6" fontFamily={Fonts.SemiBold} style={styles.sectionTitle}>
                    Frequently Asked Questions
                </CustomText>

                {faqSections.map((section, sectionIndex) => (
                    <View key={sectionIndex} style={styles.faqSection}>
                        <View style={styles.faqSectionHeader}>
                            <View style={styles.sectionIconBox}>
                                <Icon name={section.icon} size={18} color={Colors.secondary} />
                            </View>
                            <CustomText variant="h7" fontFamily={Fonts.SemiBold}>
                                {section.title}
                            </CustomText>
                        </View>

                        {section.faqs.map((faq, faqIndex) => (
                            <FAQAccordion key={faqIndex} faq={faq} index={faqIndex} />
                        ))}
                    </View>
                ))}

                {/* Still Need Help */}
                <View style={styles.needHelpCard}>
                    <Icon name="chatbubbles-outline" size={32} color={Colors.secondary} />
                    <View style={styles.needHelpContent}>
                        <CustomText variant="h7" fontFamily={Fonts.SemiBold}>
                            Still need help?
                        </CustomText>
                        <CustomText variant="h9" style={styles.needHelpSubtitle}>
                            Our support team is just a tap away
                        </CustomText>
                    </View>
                    <TouchableOpacity
                        style={styles.contactButton}
                        onPress={() => navigation.navigate('SupportScreen' as never)}
                    >
                        <CustomText variant="h8" fontFamily={Fonts.SemiBold} style={styles.contactButtonText}>
                            Contact Us
                        </CustomText>
                    </TouchableOpacity>
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
    headerSection: {
        marginBottom: 20,
    },
    headerTitle: {
        color: Colors.text,
        marginBottom: 6,
    },
    headerSubtitle: {
        color: Colors.text,
        opacity: 0.7,
        lineHeight: 20,
    },
    quickLinksContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 10,
    },
    quickLinkCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    quickLinkIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickLinkLabel: {
        color: Colors.text,
        textAlign: 'center',
    },
    sectionTitle: {
        color: Colors.text,
        marginBottom: 16,
    },
    faqSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    faqSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        backgroundColor: Colors.backgroundSecondary,
        gap: 10,
    },
    sectionIconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    faqItem: {
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: Colors.backgroundSecondary,
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    faqQuestion: {
        color: Colors.text,
        flex: 1,
        marginRight: 10,
    },
    faqAnswer: {
        color: Colors.text,
        opacity: 0.7,
        marginTop: 10,
        lineHeight: 20,
    },
    needHelpCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        gap: 12,
    },
    needHelpContent: {
        flex: 1,
    },
    needHelpSubtitle: {
        color: Colors.text,
        opacity: 0.6,
        marginTop: 2,
    },
    contactButton: {
        backgroundColor: Colors.secondary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    contactButtonText: {
        color: '#fff',
    },
    footerSpacer: {
        height: 40,
    },
});

export default HelpCenterScreen;
