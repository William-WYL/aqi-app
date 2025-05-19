import { useEffect, useState } from 'react';
import { LoadScript, GoogleMap, Marker } from '@react-google-maps/api';
import useAirQualityStore from '../../store/airQualityStore';
import '../../styles/components.css';
import capitalizeWords from "../../utilities/capitalizeWords";

const InfoContainer = () => {
  const {
    aqi,
    city,
    time,
    weather,
    location,
    getAQIStatus,
    getDominantPollutantInfo,
    loading,
    error,
    clearData,
    clearError
  } = useAirQualityStore();

  // State to track flip status
  const [isFlipped, setIsFlipped] = useState(false);

  // If error occurs, clearData in store.
  useEffect(() => {
    if (error) {
      clearData('');
    }
  }, [error, clearData]);


  // Get air quality status information
  const aqiStatus = getAQIStatus();
  const dominantPollutant = getDominantPollutantInfo();

  // Format time to HH:MM
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date to "Mon May 19" style
  const formatDate = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Map container styles
  const mapStyles = {
    height: "100%",
    width: "100%",
    borderRadius: "0.5rem",
  };

  return (

    <div className="bg-white rounded-lg p-6">
      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="text-red-800 hover:text-red-600 focus:outline-none"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Header with city and update information */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {city && capitalizeWords(city) || 'City'} Air Quality Index
          </h2>
          {time && (
            <p className="text-sm text-gray-500">
              Updated {formatDate(time)} {formatTime(time)}
            </p>
          )}
        </div>
      </div>

      {/* Main content area with flip card and weather info */}
      <div className="flex h-100 md:h-auto flex-col md:flex-row gap-6">
        {/* Flip card container - vertical flip animation */}
        <div
          className="flex-1 h-48 perspective-1000 cursor-pointer"
          onMouseEnter={() => setIsFlipped(true)}
          onMouseLeave={() => setIsFlipped(false)}
        >
          {/* Flip card inner container with transition */}
          <div className={`relative w-full h-full transition-transform duration-500 ease-in-out transform-style-preserve-3d ${isFlipped ? 'rotate-x-180' : ''
            }`}>
            {/* Front side - AQI information */}
            <div className="absolute w-full h-full backface-hidden bg-white rounded-lg shadow-sm p-4 flex items-center gap-4">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold 
                ${aqiStatus?.color === 'green' ? 'bg-green-500' : ''}
                ${aqiStatus?.color === 'yellow' ? 'bg-yellow-500' : ''}
                ${aqiStatus?.color === 'orange' ? 'bg-orange-500' : ''}
                ${aqiStatus?.color === 'red' ? 'bg-red-500' : ''}
                ${aqiStatus?.color === 'purple' ? 'bg-purple-500' : ''}
                ${aqiStatus?.color === 'maroon' ? 'bg-red-800' : ''}
                ${!aqiStatus ? 'bg-gray-300' : ''}
              `}>
                {aqi || '--'}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {aqiStatus?.level || 'No data'}
                </h3>
                <p className="text-gray-600 text-xs">PM2.5</p>
                <p className="text-gray-600">{aqiStatus?.text || 'Search for a city to see air quality data'}</p>
              </div>
            </div>

            {/* Back side - Map view */}
            <div className="absolute w-full h-full backface-hidden bg-white rounded-lg shadow-sm rotate-x-180">
              {location.coordinates ? (
                <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                  <GoogleMap
                    mapContainerStyle={mapStyles}
                    zoom={12}
                    center={{ lat: location.coordinates[0], lng: location.coordinates[1] }}
                    options={{
                      disableDefaultUI: true,
                      zoomControl: true,
                    }}
                  >
                    <Marker
                      position={{ lat: location.coordinates[0], lng: location.coordinates[1] }}
                    />
                  </GoogleMap>
                </LoadScript>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No location data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Weather and pollutant information (unchanged) */}
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-4">
            {/* Temperature */}
            <div className="bg-gray-50 p-2 rounded-lg">
              <p className="text-sm text-gray-500">Temp.</p>
              <p className="text-xl font-semibold">
                {weather.temperature ? `${weather.temperature}°C` : '--'}
              </p>
            </div>

            {/* Humidity */}
            <div className="bg-gray-50 p-2 rounded-lg">
              <p className="text-sm text-gray-500">Humidity</p>
              <p className="text-xl font-semibold">
                {weather.humidity ? `${weather.humidity}%` : '--'}
              </p>
            </div>

            {/* Main Pollutant */}
            <div className="bg-gray-50 p-2 rounded-lg">
              <p className="text-sm text-gray-500">Main Pollutant</p>
              <p className="text-xl font-semibold">
                {dominantPollutant ? dominantPollutant.name : '--'}
              </p>
            </div>

            {/* Wind Speed */}
            <div className="bg-gray-50 p-2 rounded-lg">
              <p className="text-sm text-gray-500">Wind Speed</p>
              <p className="text-xl font-semibold">
                {weather.windSpeed ? `${weather.windSpeed?.toFixed(2) ?? '--'} km/h` : '--'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-lg flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading air quality data...</span>
        </div>
      )}
    </div>
  );
};

export default InfoContainer;