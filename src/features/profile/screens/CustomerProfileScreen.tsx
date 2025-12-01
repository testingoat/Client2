import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';
import CustomHeader from '@components/ui/CustomHeader';
import CustomText from '@components/ui/CustomText';
import { Colors, Fonts } from '@utils/Constants';
import { useAuthStore } from '@state/authStore';
import Icon from 'react-native-vector-icons/Ionicons';
import { RFValue } from 'react-native-responsive-fontsize';

const CustomerProfileScreen = () => {
    const { user } = useAuthStore();

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [dob, setDob] = useState(''); // Placeholder for now
    const [gender, setGender] = useState(''); // Placeholder for now

    // Format phone number for display
    const formatPhone = (phone: string | number | undefined) => {
        if (!phone) return '';
        const phoneStr = phone.toString();
        return `+91 ${phoneStr.replace(/(\d{5})(\d{5})/, '$1 $2')}`;
    };

    return (
        <View style={styles.container}>
            <CustomHeader title="Edit Profile" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Avatar Section */}
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarPlaceholder}>
                            <CustomText variant="h1" fontFamily={Fonts.Bold} style={styles.avatarInitials}>
                                {name ? name.charAt(0).toUpperCase() : 'U'}
                            </CustomText>
                            <View style={styles.cameraIconContainer}>
                                <Icon name="camera" size={14} color="#fff" />
                            </View>
                        </View>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.formContainer}>

                        <View style={styles.inputGroup}>
                            <CustomText variant="h8" fontFamily={Fonts.Medium} style={styles.label}>Name</CustomText>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter your name"
                                placeholderTextColor={Colors.disabled}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <CustomText variant="h8" fontFamily={Fonts.Medium} style={styles.label}>Phone Number</CustomText>
                            <View style={[styles.input, styles.disabledInput]}>
                                <CustomText variant="h8" fontFamily={Fonts.Regular} style={{ color: Colors.disabled }}>
                                    {formatPhone(user?.phone)}
                                </CustomText>
                                <Icon name="lock-closed-outline" size={16} color={Colors.disabled} />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <CustomText variant="h8" fontFamily={Fonts.Medium} style={styles.label}>Email Address</CustomText>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter your email"
                                placeholderTextColor={Colors.disabled}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <CustomText variant="h8" fontFamily={Fonts.Medium} style={styles.label}>Date of Birth</CustomText>
                            <TextInput
                                style={styles.input}
                                value={dob}
                                onChangeText={setDob}
                                placeholder="DD/MM/YYYY"
                                placeholderTextColor={Colors.disabled}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <CustomText variant="h8" fontFamily={Fonts.Medium} style={styles.label}>Gender</CustomText>
                            <TextInput
                                style={styles.input}
                                value={gender}
                                onChangeText={setGender}
                                placeholder="Select Gender"
                                placeholderTextColor={Colors.disabled}
                            />
                        </View>

                    </View>

                </ScrollView>

                {/* Footer Button */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.updateButton}>
                        <CustomText variant="h6" fontFamily={Fonts.SemiBold} style={styles.buttonText}>
                            Update Profile
                        </CustomText>
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    avatarContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    avatarInitials: {
        color: Colors.primary,
        fontSize: RFValue(30),
    },
    cameraIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.primary,
        padding: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#fff',
    },
    formContainer: {
        marginTop: 10,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        marginBottom: 8,
        color: Colors.text,
        opacity: 0.8,
    },
    input: {
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: 10,
        padding: 15,
        fontFamily: Fonts.Regular,
        fontSize: RFValue(12),
        color: Colors.text,
    },
    disabledInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        opacity: 0.7,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: Colors.backgroundSecondary,
        backgroundColor: '#fff',
    },
    updateButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
    },
});

export default CustomerProfileScreen;
