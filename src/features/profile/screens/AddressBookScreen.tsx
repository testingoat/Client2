import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import CustomHeader from '@components/ui/CustomHeader';
import CustomText from '@components/ui/CustomText';
import { Colors, Fonts } from '@utils/Constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RFValue } from 'react-native-responsive-fontsize';
import CustomButton from '@components/ui/CustomButton';
import CustomInput from '@components/ui/CustomInput';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAddressStore } from '@state/addressStore';
import { getValidatedDeliveryLocation } from '@service/locationService';

const initialForm = {
  label: 'Home',
  houseNumber: '',
  street: '',
  landmark: '',
  city: '',
  state: '',
  pincode: '',
  latitude: '',
  longitude: '',
  isDefault: false,
};

const AddressBookScreen = () => {
  const insets = useSafeAreaInsets();
  const {
    addresses,
    selectedAddressId,
    loadAddresses,
    selectAddress,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    loading,
  } = useAddressStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const openModalForAdd = () => {
    setEditingId(null);
    setForm(initialForm);
    setModalVisible(true);
  };

  const openModalForEdit = (address: any) => {
    setEditingId(address._id);
    setForm({
      label: address.label || 'Home',
      houseNumber: address.houseNumber || '',
      street: address.street || '',
      landmark: address.landmark || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      latitude: String(address.latitude ?? ''),
      longitude: String(address.longitude ?? ''),
      isDefault: Boolean(address.isDefault),
    });
    setModalVisible(true);
  };

  const handleUseCurrentLocation = async () => {
    setLocating(true);
    try {
      const location = await getValidatedDeliveryLocation();
      if (location) {
        setForm(prev => ({
          ...prev,
          latitude: location.latitude.toString(),
          longitude: location.longitude.toString(),
        }));
      }
    } catch (error) {
      console.warn('Location error', error);
    } finally {
      setLocating(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!form.houseNumber || !form.street || !form.city) {
      Alert.alert('Missing Fields', 'House number, street, and city are required.');
      return;
    }
    if (!form.latitude || !form.longitude) {
      Alert.alert('Location Required', 'Tap "Use current location" to capture coordinates.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        label: form.label,
        houseNumber: form.houseNumber,
        street: form.street,
        landmark: form.landmark,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        isDefault: form.isDefault,
      };
      if (editingId) {
        await updateAddress(editingId, payload);
      } else {
        await createAddress(payload);
      }
      setModalVisible(false);
      setForm(initialForm);
      setEditingId(null);
    } catch (error: any) {
      Alert.alert('Unable to save address', error?.response?.data?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAddress(id);
          } catch (error: any) {
            Alert.alert('Failed to delete address', error?.response?.data?.message || 'Please try again.');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: any }) => {
    const isSelected = item._id === selectedAddressId;
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => selectAddress(item._id)}
        style={[
          styles.addressCard,
          isSelected && { borderColor: Colors.secondary, borderWidth: 1.2 },
        ]}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Icon
              name={item.label?.toLowerCase() === 'work' ? 'briefcase' : 'home'}
              size={RFValue(18)}
              color={Colors.secondary}
            />
            <CustomText fontFamily={Fonts.SemiBold} variant="h7" style={{ marginLeft: 6 }}>
              {item.label || 'Address'}
            </CustomText>
            {item.isDefault && (
              <View style={styles.defaultBadge}>
                <CustomText variant="h9" style={styles.defaultBadgeText}>
                  Default
                </CustomText>
              </View>
            )}
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity onPress={() => openModalForEdit(item)} style={styles.iconButton}>
              <Icon name="pencil" size={RFValue(16)} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.iconButton}>
              <Icon name="trash-can-outline" size={RFValue(16)} color={Colors.error || '#AB1C2E'} />
            </TouchableOpacity>
          </View>
        </View>
        <CustomText fontFamily={Fonts.Regular} variant="h8" style={styles.addressText}>
          {[item.houseNumber, item.street, item.landmark, item.city, item.pincode]
            .filter(Boolean)
            .join(', ')}
        </CustomText>
        <View style={styles.footerRow}>
          <View style={styles.selectionRow}>
            <Icon
              name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
              size={RFValue(18)}
              color={isSelected ? Colors.secondary : '#999'}
            />
            <CustomText style={{ marginLeft: 6 }} variant="h9">
              {isSelected ? 'Delivering here' : 'Tap to deliver here'}
            </CustomText>
          </View>
          {!item.isDefault && (
            <TouchableOpacity onPress={() => setDefaultAddress(item._id)}>
              <CustomText variant="h9" style={styles.setDefaultText}>
                Set as default
              </CustomText>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Address Book" />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.secondary} />
        </View>
      ) : (
        <FlatList
          data={addresses}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={[styles.listContent, { paddingBottom: 120 + insets.bottom }]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="map-marker-off" size={RFValue(50)} color="#ccc" />
              <CustomText fontFamily={Fonts.Medium} style={styles.emptyText}>
                No addresses found. Add one to continue.
              </CustomText>
            </View>
          }
        />
      )}

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <CustomButton title="ADD NEW ADDRESS" onPress={openModalForAdd} style={styles.addButton} />
      </View>

      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoidingView}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <CustomText fontFamily={Fonts.Bold} variant="h5">
                  {editingId ? 'Edit Address' : 'Add Address'}
                </CustomText>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Icon name="close" size={RFValue(22)} color="#000" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <CustomText fontFamily={Fonts.SemiBold} style={styles.label}>
                  Label
                </CustomText>
                <View style={styles.typeRow}>
                  {['Home', 'Work', 'Other'].map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.typeChip, form.label === type && styles.activeChip]}
                      onPress={() => setForm(prev => ({ ...prev, label: type }))}>
                      <CustomText
                        fontFamily={Fonts.Medium}
                        style={[styles.chipText, form.label === type && styles.activeChipText]}>
                        {type}
                      </CustomText>
                    </TouchableOpacity>
                  ))}
                </View>

                <CustomText fontFamily={Fonts.SemiBold} style={styles.label}>
                  House No / Flat / Building
                </CustomText>
                <CustomInput
                  left={<Icon name="home-outline" size={RFValue(18)} color="#666" />}
                  value={form.houseNumber}
                  onChangeText={text => setForm(prev => ({ ...prev, houseNumber: text }))}
                  placeholder="e.g. A-101"
                />

                <CustomText fontFamily={Fonts.SemiBold} style={styles.label}>
                  Street / Locality
                </CustomText>
                <CustomInput
                  left={<Icon name="road-variant" size={RFValue(18)} color="#666" />}
                  value={form.street}
                  onChangeText={text => setForm(prev => ({ ...prev, street: text }))}
                  placeholder="Street name"
                />

                <CustomText fontFamily={Fonts.SemiBold} style={styles.label}>
                  Landmark (optional)
                </CustomText>
                <CustomInput
                  left={<Icon name="map-marker" size={RFValue(18)} color="#666" />}
                  value={form.landmark}
                  onChangeText={text => setForm(prev => ({ ...prev, landmark: text }))}
                  placeholder="Near ..."
                />

                <CustomText fontFamily={Fonts.SemiBold} style={styles.label}>
                  City
                </CustomText>
                <CustomInput
                  left={<Icon name="city" size={RFValue(18)} color="#666" />}
                  value={form.city}
                  onChangeText={text => setForm(prev => ({ ...prev, city: text }))}
                  placeholder="City"
                />

                <CustomText fontFamily={Fonts.SemiBold} style={styles.label}>
                  State
                </CustomText>
                <CustomInput
                  left={<Icon name="earth" size={RFValue(18)} color="#666" />}
                  value={form.state}
                  onChangeText={text => setForm(prev => ({ ...prev, state: text }))}
                  placeholder="State"
                />

                <CustomText fontFamily={Fonts.SemiBold} style={styles.label}>
                  Pincode
                </CustomText>
                <CustomInput
                  left={<Icon name="numeric" size={RFValue(18)} color="#666" />}
                  value={form.pincode}
                  onChangeText={text => setForm(prev => ({ ...prev, pincode: text }))}
                  placeholder="Pincode"
                  keyboardType="numeric"
                />

                <View style={styles.locationRow}>
                  <View style={{ flex: 1 }}>
                    <CustomText fontFamily={Fonts.SemiBold} style={styles.label}>
                      Coordinates
                    </CustomText>
                    <CustomText variant="h9" style={{ opacity: 0.7 }}>
                      {form.latitude && form.longitude
                        ? `${form.latitude}, ${form.longitude}`
                        : 'Tap button to auto-detect'}
                    </CustomText>
                  </View>
                  <TouchableOpacity style={styles.locateBtn} onPress={handleUseCurrentLocation} disabled={locating}>
                    {locating ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <CustomText variant="h9" style={{ color: '#fff' }}>
                        Use current location
                      </CustomText>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.defaultRow}>
                  <CustomText variant="h8">Set as default</CustomText>
                  <Switch
                    value={form.isDefault}
                    onValueChange={value => setForm(prev => ({ ...prev, isDefault: value }))}
                    thumbColor={form.isDefault ? Colors.secondary : '#f4f3f4'}
                  />
                </View>
              </ScrollView>

              <CustomButton
                title={editingId ? 'UPDATE ADDRESS' : 'SAVE ADDRESS'}
                onPress={handleSaveAddress}
                loading={saving}
                style={{ marginTop: 12 }}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  listContent: {
    padding: 16,
    gap: 14,
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderColor: '#f0f0f0',
    borderWidth: 1,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  defaultBadge: {
    backgroundColor: '#E9F7EF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    marginLeft: 6,
  },
  defaultBadgeText: {
    color: '#0B8F3A',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 6,
  },
  iconButton: {
    padding: 6,
  },
  addressText: {
    opacity: 0.8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setDefaultText: {
    color: Colors.secondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    color: '#999',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
  },
  addButton: {
    borderRadius: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  typeChip: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeChip: {
    backgroundColor: '#EAF6EF',
    borderColor: Colors.secondary,
  },
  chipText: {
    color: '#666',
  },
  activeChipText: {
    color: Colors.secondary,
  },
  label: {
    marginTop: 12,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  locateBtn: {
    backgroundColor: Colors.secondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
});

export default AddressBookScreen;
