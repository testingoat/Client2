import { appAxios } from './apiInterceptors';

export interface AddressRecord {
  _id: string;
  label: string;
  houseNumber: string;
  street: string;
  landmark?: string;
  city: string;
  state?: string;
  pincode?: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export interface AddressPayload {
  label?: string;
  houseNumber: string;
  street: string;
  landmark?: string;
  city: string;
  state?: string;
  pincode?: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
}

const extractAddresses = (response: any): AddressRecord[] =>
  response?.data?.addresses || response?.addresses || [];

export const fetchAddresses = async (): Promise<AddressRecord[]> => {
  const response = await appAxios.get('/customer/addresses');
  return extractAddresses(response.data);
};

export const createAddress = async (
  payload: AddressPayload,
): Promise<AddressRecord[]> => {
  const response = await appAxios.post('/customer/addresses', payload);
  return extractAddresses(response.data);
};

export const updateAddress = async (
  addressId: string,
  payload: Partial<AddressPayload>,
): Promise<AddressRecord[]> => {
  const response = await appAxios.put(
    `/customer/addresses/${addressId}`,
    payload,
  );
  return extractAddresses(response.data);
};

export const deleteAddress = async (
  addressId: string,
): Promise<AddressRecord[]> => {
  const response = await appAxios.delete(`/customer/addresses/${addressId}`);
  return extractAddresses(response.data);
};

export const setDefaultAddress = async (
  addressId: string,
): Promise<AddressRecord[]> => {
  const response = await appAxios.post(
    `/customer/addresses/${addressId}/default`,
  );
  return extractAddresses(response.data);
};
