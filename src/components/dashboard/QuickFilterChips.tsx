import React, { FC, useState, useCallback } from 'react'
import { View, StyleSheet, ScrollView, Pressable, Animated } from 'react-native'
import CustomText from '@components/ui/CustomText'
import { Colors, Fonts } from '@utils/Constants'
import Icon from 'react-native-vector-icons/Ionicons'
import LinearGradient from 'react-native-linear-gradient'

export interface FilterChip {
    id: string
    label: string
    icon?: string
    value?: string | number
}

interface QuickFilterChipsProps {
    chips: FilterChip[]
    onSelect?: (chip: FilterChip) => void
    selectedId?: string | null
    style?: object
}

const defaultChips: FilterChip[] = [
    { id: 'under500', label: 'Under ₹500', icon: 'pricetag', value: 500 },
    { id: 'fresh', label: 'Fresh Today', icon: 'leaf', value: 'fresh' },
    { id: 'popular', label: 'Popular', icon: 'star', value: 'popular' },
    { id: 'newArrivals', label: 'New Arrivals', icon: 'sparkles', value: 'new' },
    { id: 'deals', label: 'Best Deals', icon: 'flash', value: 'deals' },
    { id: 'organic', label: 'Organic', icon: 'nutrition', value: 'organic' },
]

/**
 * Horizontal scrollable quick filter chips for the dashboard.
 */
const QuickFilterChips: FC<QuickFilterChipsProps> = ({
    chips = defaultChips,
    onSelect,
    selectedId = null,
    style,
}) => {
    const [selected, setSelected] = useState<string | null>(selectedId)

    const handlePress = useCallback((chip: FilterChip) => {
        const newSelected = selected === chip.id ? null : chip.id
        setSelected(newSelected)
        onSelect?.(newSelected ? chip : { id: '', label: '', value: '' })
    }, [selected, onSelect])

    const renderChip = (chip: FilterChip) => {
        const isSelected = selected === chip.id

        return (
            <Pressable
                key={chip.id}
                onPress={() => handlePress(chip)}
                style={({ pressed }) => [
                    styles.chipContainer,
                    pressed && styles.chipPressed,
                ]}
            >
                {isSelected ? (
                    <LinearGradient
                        colors={['#FF6B35', '#FF5A5A']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.chip}
                    >
                        {chip.icon && (
                            <Icon name={chip.icon} size={14} color="#fff" />
                        )}
                        <CustomText style={styles.chipTextSelected} fontFamily={Fonts.SemiBold}>
                            {chip.label}
                        </CustomText>
                    </LinearGradient>
                ) : (
                    <View style={styles.chip}>
                        {chip.icon && (
                            <Icon name={chip.icon} size={14} color={Colors.text} />
                        )}
                        <CustomText style={styles.chipText} fontFamily={Fonts.Medium}>
                            {chip.label}
                        </CustomText>
                    </View>
                )}
            </Pressable>
        )
    }

    return (
        <View style={[styles.container, style]}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {chips.map(renderChip)}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 12,
        marginBottom: 4,
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 8,
    },
    chipContainer: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    chipPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    chipText: {
        color: Colors.text,
        fontSize: 12,
    },
    chipTextSelected: {
        color: '#fff',
        fontSize: 12,
    },
})

export default QuickFilterChips
