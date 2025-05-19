import { create } from "zustand";

/* 
The zustand store handles everything you need:
  API fetching
  Data parsing and storage
  Loading states
  Error handling
  Helper functions (getAQIStatus, etc.)
*/

const useAirQualityStore = create((set, get) => ({
  // Main AQI data
  aqi: null,
  city: null,
  time: null,
  dominantPollutant: null,

  // Individual pollutant readings
  pollutants: {
    pm25: null,
    pm10: null,
    co: null,
    no2: null,
    o3: null,
    so2: null,
  },

  // Weather data
  weather: {
    temperature: null,
    humidity: null,
    pressure: null,
    windSpeed: null,
  },

  // Forecast data
  forecast: {
    pm25: [],
    pm10: [],
    uvi: [],
    o3: [],
  },

  // Location data
  location: {
    name: null,
    coordinates: null,
    url: null,
  },

  // Attributions
  attributions: [],

  // UI states
  loading: false,
  error: null,
  alertMessage: '',
  lastUpdated: null,

  // API token
  token: 'b493c22c8c80ddcadd15082c7b083a37ca96c578',

  // Actions
  fetchAQI: async (city) => {
    set({
      loading: true,
      alertMessage: '',
      error: null,
      city: city
    });

    const { token } = get();

    try {
      const response = await fetch(`https://api.waqi.info/feed/${city}/?token=${token}`);
      const data = await response.json();

      console.log("API Response:", data);

      if (data.status === "ok") {
        const apiData = data.data;

        // Update main AQI data
        set({
          aqi: apiData.aqi,
          time: apiData.time?.s || null,
          dominantPollutant: apiData.dominentpol || null,
          lastUpdated: new Date().toISOString(),
        });

        // Update pollutant data
        set({
          pollutants: {
            pm25: apiData.iaqi?.pm25?.v || null,
            pm10: apiData.iaqi?.pm10?.v || null,
            co: apiData.iaqi?.co?.v || null,
            no2: apiData.iaqi?.no2?.v || null,
            o3: apiData.iaqi?.o3?.v || null,
            so2: apiData.iaqi?.so2?.v || null,
          }
        });

        // Update weather data
        set({
          weather: {
            temperature: apiData.iaqi?.t?.v || null,
            humidity: apiData.iaqi?.h?.v || null,
            pressure: apiData.iaqi?.p?.v || null,
            windSpeed: apiData.iaqi?.w?.v || null,
          }
        });

        // Update location data
        set({
          location: {
            name: apiData.city?.name || null,
            coordinates: apiData.city?.geo || null,
            url: apiData.city?.url || null,
          }
        });

        // Update forecast data
        set({
          forecast: {
            pm25: apiData.forecast?.daily?.pm25 || [],
            pm10: apiData.forecast?.daily?.pm10 || [],
            uvi: apiData.forecast?.daily?.uvi || [],
            o3: apiData.forecast?.daily?.o3 || [],
          }
        });

        // Update attributions
        set({
          attributions: apiData.attributions || []
        });

        set({ alertMessage: '✅ Data updated successfully' });

      } else {
        throw new Error(data.data || "Invalid response from API");
      }
    } catch (error) {
      set({
        error: error.message,
        alertMessage: '⚠️ Failed to fetch air quality data'
      });
      console.error("Fetch AQI Error:", error);
    } finally {
      set({ loading: false });
    }
  },

  // Clear all data
  clearData: () => {
    set({
      aqi: null,
      city: null,
      time: null,
      dominantPollutant: null,
      pollutants: {
        pm25: null,
        pm10: null,
        co: null,
        no2: null,
        o3: null,
        so2: null,
      },
      weather: {
        temperature: null,
        humidity: null,
        pressure: null,
        windSpeed: null,
      },
      forecast: {
        pm25: [],
        pm10: [],
        uvi: [],
        o3: [],
      },
      location: {
        name: null,
        coordinates: null,
        url: null,
      },
      attributions: [],
      // error: null,
      alertMessage: '',
      lastUpdated: null,
    });
  },

  // Set alert message
  setAlertMessage: (message) => {
    set({ alertMessage: message });
  },

  // Clear alert message
  clearAlertMessage: () => {
    set({ alertMessage: '' });
  },

  // Set error
  setError: (error) => {
    set({ error, alertMessage: `⚠️ ${error}` });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Auto-refresh functionality
  startAutoRefresh: (city, intervalMinutes = 30) => {
    const { fetchAQI } = get();
    const intervalId = setInterval(() => {
      fetchAQI(city);
    }, intervalMinutes * 60 * 1000);

    // Store the interval ID so it can be cleared later
    set({ autoRefreshId: intervalId });

    return intervalId;
  },

  // Stop auto-refresh
  stopAutoRefresh: () => {
    const { autoRefreshId } = get();
    if (autoRefreshId) {
      clearInterval(autoRefreshId);
      set({ autoRefreshId: null });
    }
  },

  // Get AQI health status
  getAQIStatus: () => {
    const { aqi } = get();
    if (!aqi) return null;

    if (aqi <= 50) return { level: 'Good', color: 'green', text: 'Air quality is satisfactory' };
    if (aqi <= 100) return { level: 'Moderate', color: 'yellow', text: 'Air quality is acceptable' };
    if (aqi <= 150) return { level: 'Unhealthy for Sensitive Groups', color: 'orange', text: 'Sensitive people should limit outdoor activities' };
    if (aqi <= 200) return { level: 'Unhealthy', color: 'red', text: 'Everyone should limit outdoor activities' };
    if (aqi <= 300) return { level: 'Very Unhealthy', color: 'purple', text: 'Everyone should avoid outdoor activities' };
    return { level: 'Hazardous', color: 'maroon', text: 'Emergency conditions - everyone should stay indoors' };
  },

  // Get dominant pollutant info
  getDominantPollutantInfo: () => {
    const { dominantPollutant, pollutants } = get();

    const pollutantMap = {
      pm25: { name: 'PM2.5', value: pollutants.pm25, unit: 'μg/m³' },
      pm10: { name: 'PM10', value: pollutants.pm10, unit: 'μg/m³' },
      co: { name: 'Carbon Monoxide', value: pollutants.co, unit: 'mg/m³' },
      no2: { name: 'Nitrogen Dioxide', value: pollutants.no2, unit: 'ppb' },
      o3: { name: 'Ozone', value: pollutants.o3, unit: 'ppb' },
      so2: { name: 'Sulfur Dioxide', value: pollutants.so2, unit: 'ppb' },
    };

    return dominantPollutant ? pollutantMap[dominantPollutant] : null;
  },

  // Auto-refresh interval ID (stored in state for cleanup)
  autoRefreshId: null,
}));

export default useAirQualityStore;