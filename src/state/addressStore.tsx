import { create } from 'zustand';
import {
  AddressRecord,
  AddressPayload,
  fetchAddresses,
  createAddress as apiCreateAddress,
  updateAddress as apiUpdateAddress,
  deleteAddress as apiDeleteAddress,
  setDefaultAddress as apiSetDefaultAddress,
} from '@service/addressService';

interface AddressState {
  addresses: AddressRecord[];
  selectedAddressId: string | null;
  loading: boolean;
  error: string | null;
  loadAddresses: () => Promise<void>;
  setAddresses: (addresses: AddressRecord[]) => void;
  selectAddress: (addressId: string | null) => void;
  createAddress: (payload: AddressPayload) => Promise<void>;
  updateAddress: (
    addressId: string,
    payload: Partial<AddressPayload>,
  ) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
}

const determineSelection = (
  addresses: AddressRecord[],
  currentSelected: string | null,
) => {
  if (currentSelected && addresses.some(addr => addr._id === currentSelected)) {
    return currentSelected;
  }
  const defaultAddr = addresses.find(addr => addr.isDefault);
  if (defaultAddr) {
    return defaultAddr._id;
  }
  return addresses[0]?._id || null;
};

export const useAddressStore = create<AddressState>((set, get) => ({
  addresses: [],
  selectedAddressId: null,
  loading: false,
  error: null,
  setAddresses: (addresses: AddressRecord[]) =>
    set(state => ({
      addresses,
      selectedAddressId: determineSelection(addresses, state.selectedAddressId),
    })),
  selectAddress: (addressId: string | null) => set({ selectedAddressId: addressId }),
  loadAddresses: async () => {
    set({ loading: true, error: null });
    try {
      const addresses = await fetchAddresses();
      set(state => ({
        addresses,
        selectedAddressId: determineSelection(addresses, state.selectedAddressId),
        loading: false,
      }));
    } catch (error: any) {
      set({ loading: false, error: error?.message || 'Failed to load addresses' });
    }
  },
  createAddress: async (payload) => {
    const addresses = await apiCreateAddress(payload);
    get().setAddresses(addresses);
  },
  updateAddress: async (addressId, payload) => {
    const addresses = await apiUpdateAddress(addressId, payload);
    get().setAddresses(addresses);
  },
  deleteAddress: async (addressId) => {
    const addresses = await apiDeleteAddress(addressId);
    get().setAddresses(addresses);
  },
  setDefaultAddress: async (addressId) => {
    const addresses = await apiSetDefaultAddress(addressId);
    get().setAddresses(addresses);
  },
}));
