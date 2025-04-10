import { apiClient } from './api.service';

// Google Maps API key - Replace with your actual API key
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

// Load Google Maps API script
export function loadGoogleMapsApi() {
  return new Promise((resolve, reject) => {
    // Check if API is already loaded
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    // Set callback function
    window.initGoogleMaps = () => {
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error('Google Maps API failed to load'));
      }
    };

    script.src += '&callback=initGoogleMaps';
    
    // Handle errors
    script.onerror = () => {
      reject(new Error('Google Maps API failed to load'));
    };

    // Append script to document
    document.head.appendChild(script);
  });
}

// Geocode an address to get coordinates
export function geocodeAddress(address) {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps) {
      reject(new Error('Google Maps API not loaded'));
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        resolve({
          address: results[0].formatted_address,
          coordinates: [location.lng(), location.lat()]
        });
      } else {
        reject(new Error(`Geocoding failed: ${status}`));
      }
    });
  });
}

// Reverse geocode coordinates to get address
export function reverseGeocode(lat, lng) {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps) {
      reject(new Error('Google Maps API not loaded'));
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat, lng };

    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === 'OK' && results[0]) {
        resolve({
          address: results[0].formatted_address,
          coordinates: [lng, lat]
        });
      } else {
        reject(new Error(`Reverse geocoding failed: ${status}`));
      }
    });
  });
}

// Calculate route between two points
export function calculateRoute(origin, destination) {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps) {
      reject(new Error('Google Maps API not loaded'));
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: origin.coordinates ? 
          new window.google.maps.LatLng(origin.coordinates[1], origin.coordinates[0]) : 
          origin.address,
        destination: destination.coordinates ? 
          new window.google.maps.LatLng(destination.coordinates[1], destination.coordinates[0]) : 
          destination.address,
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === 'OK') {
          const route = result.routes[0];
          const leg = route.legs[0];
          
          resolve({
            distance: leg.distance.value, // in meters
            duration: leg.duration.value, // in seconds
            startAddress: leg.start_address,
            endAddress: leg.end_address,
            steps: leg.steps,
            polyline: route.overview_polyline
          });
        } else {
          reject(new Error(`Route calculation failed: ${status}`));
        }
      }
    );
  });
}

// Update driver location in the backend
export function updateDriverLocation(coordinates) {
  return apiClient.put('/drivers/location', { coordinates });
}

// Get driver's current location from the backend
export function getDriverLocation(driverId) {
  return apiClient.get(`/drivers/${driverId}/location`);
}

// Get nearest drivers to a location
export function getNearestDrivers(coordinates, limit = 5) {
  return apiClient.get('/drivers/nearest', {
    params: {
      lat: coordinates[1],
      lng: coordinates[0],
      limit
    }
  });
}