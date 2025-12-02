            } catch (error) {
    console.error("Error requesting permission:", error);
}
        } else {
    openSettings();
}
    };

const renderPermissionCard = (
    type: 'location' | 'notification' | 'camera',
    title: string,
    description: string,
    icon: string
) => {
    const status = permissions[type];
    const isGranted = status === RESULTS.GRANTED;
    const isBlocked = status === RESULTS.BLOCKED;

    return (
        <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <Icon name={icon} size={22} color={Colors.primary} />
                </View>
                <View style={styles.headerTextContainer}>
                    <CustomText variant="h6" fontFamily={Fonts.Bold} style={styles.cardTitle}>
                        {title}
                    </CustomText>
                    <View style={[styles.statusBadge, isGranted ? styles.statusGranted : styles.statusDenied]}>
                        <Icon
                            name={isGranted ? "checkmark-circle" : "alert-circle"}
                            size={12}
                            color={isGranted ? "#15803d" : "#b91c1c"}
                        />
                        <CustomText variant="h9" fontFamily={Fonts.Bold} style={[styles.statusText, { color: isGranted ? "#15803d" : "#b91c1c" }]}>
                            {isGranted ? "ALLOWED" : isBlocked ? "BLOCKED" : "DENIED"}
                        </CustomText>
                    </View>
                </View>
            </View>

            <CustomText variant="h8" fontFamily={Fonts.Regular} style={styles.description}>
                {description}
            </CustomText>

            {!isGranted && (
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handlePermissionAction(type)}
                    activeOpacity={0.7}
                >
                    <CustomText variant="h7" fontFamily={Fonts.SemiBold} style={styles.actionButtonText}>
                        {isBlocked ? "Open Settings" : "Allow Access"}
                    </CustomText>
                </TouchableOpacity>
            )}
        </View>
    );
};

return (
    <View style={styles.container}>
        <CustomHeader title="Permissions" />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

            <View style={styles.introContainer}>
                <CustomText variant="h5" fontFamily={Fonts.SemiBold} style={styles.mainTitle}>
                    App Permissions
                </CustomText>
                <CustomText variant="h7" fontFamily={Fonts.Regular} style={styles.mainSubtitle}>
                    To provide the best experience, GoatGoat needs access to certain features on your device.
                </CustomText>
            </View>

            {renderPermissionCard(
                'location',
                'Location',
                'We need your location to show you nearby stores, calculate accurate delivery fees, and track your orders in real-time.',
                'location-outline'
            )}

            {renderPermissionCard(
                'notification',
                'Notifications',
                'Enable notifications to receive timely updates on your order status, delivery driver location, and exclusive offers.',
                'notifications-outline'
            )}

            {renderPermissionCard(
                'camera',
                'Camera',
                'Camera access is required to upload profile pictures, scan QR codes, and attach photos to support tickets.',
                'camera-outline'
            )}

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
        marginBottom: 10,
    },
    iconContainer: {
        backgroundColor: Colors.backgroundSecondary,
        padding: 10,
        borderRadius: 10,
        marginRight: 12,
    },
    headerTextContainer: {
        flex: 1,
    },
    cardTitle: {
        color: Colors.text,
        marginBottom: 4,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    statusGranted: {
        backgroundColor: '#dcfce7',
    },
    statusDenied: {
        backgroundColor: '#fee2e2',
    },
    statusText: {
        marginLeft: 4,
        fontSize: 10,
    },
    description: {
        color: Colors.text,
        opacity: 0.7,
        lineHeight: 18,
        marginBottom: 15,
    },
    actionButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#fff',
    },
    footerSpacer: {
        height: 20,
    }
});

export default PermissionsScreen;
