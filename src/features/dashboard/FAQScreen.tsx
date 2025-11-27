import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Colors, Fonts } from '@utils/Constants';
import CustomHeader from '@components/ui/CustomHeader';
import CustomText from '@components/ui/CustomText';

const FAQScreen = () => {
    const faqs = [
        {
            question: "1. What is the Live Goat feature?",
            answer: "Live Goat is an upcoming feature that allows you to order live goats directly through the GoatGoat app with complete transparency, tracking, and hassle-free delivery."
        },
        {
            question: "2. When will the Live Goat feature launch?",
            answer: "We are targeting a launch in Q1 2026 🚀. Stay tuned for updates!"
        },
        {
            question: "3. What types of goats will be available?",
            answer: "You will be able to choose from various breeds based on age, weight, health checks, and purpose (Qurbani, farm, resale, etc.). Detailed listings will be available once we launch."
        },
        {
            question: "4. Will I be able to track the goat before buying?",
            answer: "Yes! Once the feature launches, you’ll get access to real-time status updates, photos, health reports, and source details before confirming your order."
        },
        {
            question: "5. How will delivery work?",
            answer: "We will offer safe and verified transportation with doorstep delivery. Delivery fees may vary based on your location."
        },
        {
            question: "6. Is there a way to reserve a goat in advance?",
            answer: "Yes. You will be able to show interest or join a waitlist for early access and priority reservation once the feature goes live."
        },
        {
            question: "7. Are the goats health-checked or certified?",
            answer: "All goats listed will come with verified health checks, vaccination details, and weight confirmation for complete transparency."
        },
        {
            question: "8. Will pricing be fixed or based on weight?",
            answer: "Prices will depend on the goat’s weight, breed, and age. Every listing will clearly display full pricing details."
        },
        {
            question: "9. How can I stay updated about the feature launch?",
            answer: "Tap “Show Interest 🚀” on the page to get updates, early access, and exclusive offers."
        },
        {
            question: "10. Is this feature available in all cities?",
            answer: "Initially, Live Goat orders will launch in select cities. Availability will expand over time based on demand."
        },
        {
            question: "11. Can I cancel my order?",
            answer: "Cancellation rules will be shared at launch, but we aim to keep the process fair and flexible for all users."
        },
        {
            question: "12. Who do I contact if I have questions?",
            answer: "You can reach us anytime through the GoatGoat Support section in the app for inquiries or clarifications."
        }
    ];

    return (
        <View style={styles.container}>
            <CustomHeader title="Live Goat FAQ" />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {faqs.map((faq, index) => (
                    <View key={index} style={styles.faqItem}>
                        <CustomText variant="h6" fontFamily={Fonts.Bold} style={styles.question}>
                            {faq.question}
                        </CustomText>
                        <CustomText variant="h7" fontFamily={Fonts.Regular} style={styles.answer}>
                            {faq.answer}
                        </CustomText>
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
    faqItem: {
        marginBottom: 20,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.border, // Adding a light border instead of shadow for definition
    },
    question: {
        color: Colors.text,
        marginBottom: 8,
    },
    answer: {
        color: Colors.text,
        opacity: 0.8,
        lineHeight: 20,
    },
    footerSpacer: {
        height: 40,
    }
});

export default FAQScreen;
