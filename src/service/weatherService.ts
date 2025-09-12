import axios from 'axios';
import { GOOGLE_WEATHER_API_KEY, GOOGLE_WEATHER_ENDPOINT } from '@config/localSecrets';

export type WeatherCondition = 'rain' | 'clear' | 'cloudy' | 'snow' | 'fog' | 'unknown';

export interface CurrentConditionPayload {
  condition: WeatherCondition;
  label: string; // one-word labels per user preference
  icon: string;  // emoji for quick display
}

function mapGoogleToCondition(code?: string | null): CurrentConditionPayload {
  const c = (code || '').toLowerCase();

  // Map Google Weather API types to our conditions
  if (c.includes('rain') || c.includes('drizzle') || c.includes('thunder') || c.includes('storm')) {
    return { condition: 'rain', label: 'Rain', icon: '🌧' };
  }
  if (c.includes('clear') || c.includes('sunny') || c === 'clear') {
    return { condition: 'clear', label: 'Sunny', icon: '☀️' };
  }
  if (c.includes('cloud') || c.includes('overcast') || c.includes('partly')) {
    return { condition: 'cloudy', label: 'Cloudy', icon: '☁️' };
  }
  if (c.includes('snow') || c.includes('blizzard')) {
    return { condition: 'snow', label: 'Snow', icon: '❄️' };
  }
  if (c.includes('fog') || c.includes('mist') || c.includes('haze')) {
    return { condition: 'fog', label: 'Fog', icon: '🌫️' };
  }

  // Default to sunny for unknown conditions
  return { condition: 'clear', label: 'Sunny', icon: '☀️' };
}

// Fetch current conditions from Google Weather API (client-side)
export async function fetchCurrentConditions(lat: number, lng: number): Promise<CurrentConditionPayload> {
  try {
    // Use GET request with query parameters as per official Google Weather API docs
    const url = `${GOOGLE_WEATHER_ENDPOINT}?key=${GOOGLE_WEATHER_API_KEY}&location.latitude=${lat}&location.longitude=${lng}`;

    const { data } = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Parse the response according to Google Weather API structure
    const weatherType = data?.weatherCondition?.type;
    const description = data?.weatherCondition?.description?.text;

    // Map the weather type to our condition
    const code = weatherType || description || 'unknown';

    if (__DEV__) {
      console.log('Weather API response:', { weatherType, description, code });
    }

    return mapGoogleToCondition(code);
  } catch (e) {
    if (__DEV__) {
      console.log('Weather API error (client-side):', e);
    }
    // Never throw in UI path; provide safe default
    return { condition: 'unknown', label: 'Sunny', icon: '☀️' };
  }
}

