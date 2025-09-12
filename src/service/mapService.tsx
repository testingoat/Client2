import axios from "axios";
import { GOOGLE_MAP_API } from "./config";
import { updateUserLocation } from "./authService";

export const reverseGeocode = async (latitude: number, longitude: number, setUser: any) => {
    try {
        console.log('Reverse geocoding for:', {latitude, longitude});
        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAP_API}`
        )

        console.log('Geocoding response status:', response.data.status);

        if (response.data.status == 'OK') {
            const address = response.data.results[0].formatted_address;
            console.log('Address obtained:', address);

            const success = await updateUserLocation({ liveLocation: { latitude, longitude }, address }, setUser);
            console.log('User location update success:', success);
        } else {
            console.error("Geocoding failed:", response.data);
            console.error("Status:", response.data.status);
            console.error("Error message:", response.data.error_message);
        }

    } catch (error) {
        console.error("Geocoding error:", error);
        if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
        }
    }
}
