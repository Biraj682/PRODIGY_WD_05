/**
 * WeatherPro - Professional Weather Application
 * Vanilla JavaScript (ES6+)
 * 
 * Features:
 * - Real-time weather data from OpenWeatherMap API
 * - City search and geolocation support
 * - Temperature unit toggle (Celsius/Fahrenheit)
 * - Comprehensive error handling
 * - Responsive design with accessibility support
 */

/* ============================================
   Configuration & Constants
   ============================================ */

// API Configuration
const API_CONFIG = {
    KEY: '6f886befa00d5548068f6ef2cf72a61c', // TODO: Replace with your actual API key from https://openweathermap.org/api
    BASE_URL: 'https://api.openweathermap.org/data/2.5',
    UNITS: {
        METRIC: 'metric',    // Celsius
        IMPERIAL: 'imperial' // Fahrenheit
    }
};

// DOM Elements
const DOM_ELEMENTS = {
    // Search Elements
    searchBtn: document.getElementById('search-btn'),
    cityInput: document.getElementById('city-input'),
    locationBtn: document.getElementById('location-btn'),
    
    // Loading & Error Elements
    loadingIndicator: document.getElementById('loading'),
    errorMessage: document.getElementById('error-message'),
    
    // Weather Display Elements
    weatherSection: document.getElementById('weather-section'),
    welcomeMessage: document.getElementById('welcome-message'),
    
    // Location & Time
    locationName: document.getElementById('location-name'),
    weatherTime: document.getElementById('weather-time'),
    
    // Main Weather Display
    temperature: document.getElementById('temperature'),
    weatherDescription: document.getElementById('weather-description'),
    feelsLike: document.getElementById('feels-like'),
    weatherIcon: document.getElementById('weather-icon'),
    
    // Detail Cards
    humidityValue: document.getElementById('humidity-value'),
    windSpeedValue: document.getElementById('wind-speed-value'),
    pressureValue: document.getElementById('pressure-value'),
    visibilityValue: document.getElementById('visibility-value'),
    uvIndexValue: document.getElementById('uv-index-value'),
    cloudsValue: document.getElementById('clouds-value'),
    
    // Temperature Toggle
    tempToggle: document.getElementById('temp-toggle')
};

/* ============================================
   State Management
   ============================================ */

let appState = {
    currentWeatherData: null,
    isCelsius: true,
    lastSearchedCity: null,
    currentLatitude: null,
    currentLongitude: null
};

/* ============================================
   Event Listeners
   ============================================ */

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
    // Search button click
    DOM_ELEMENTS.searchBtn.addEventListener('click', handleCitySearch);
    
    // Enter key in input field
    DOM_ELEMENTS.cityInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleCitySearch();
        }
    });
    
    // Geolocation button click
    DOM_ELEMENTS.locationBtn.addEventListener('click', handleGeolocation);
    
    // Temperature toggle
    DOM_ELEMENTS.tempToggle.addEventListener('click', toggleTemperatureUnit);
}

/* ============================================
   Search & Location Handlers
   ============================================ */

/**
 * Handle city name search
 */
async function handleCitySearch() {
    const city = DOM_ELEMENTS.cityInput.value.trim();
    
    // Validation
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    
    if (city.length < 2) {
        showError('City name must be at least 2 characters');
        return;
    }
    
    // Fetch weather data
    await fetchWeatherByCity(city);
}

/**
 * Handle geolocation request
 * Uses browser's Geolocation API to get user's coordinates
 */
async function handleGeolocation() {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }
    
    showLoading(true);
    clearError();
    
    // Request user's location
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                appState.currentLatitude = latitude;
                appState.currentLongitude = longitude;
                
                // Fetch weather data using coordinates
                await fetchWeatherByCoordinates(latitude, longitude);
            } catch (error) {
                handleError(error);
            } finally {
                showLoading(false);
            }
        },
        (error) => {
            // Handle geolocation errors
            showLoading(false);
            
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    showError('Location permission denied. Please enable location access in your browser settings.');
                    break;
                case error.POSITION_UNAVAILABLE:
                    showError('Location information is unavailable.');
                    break;
                case error.TIMEOUT:
                    showError('The request to get user location timed out.');
                    break;
                default:
                    showError('An error occurred while retrieving your location.');
            }
        }
    );
}

/* ============================================
   API Calls - Async/Await with Error Handling
   ============================================ */

/**
 * Fetch weather data by city name
 * @param {string} city - City name to search for
 */
async function fetchWeatherByCity(city) {
    showLoading(true);
    clearError();
    
    try {
        // Validate API key
        if (API_CONFIG.KEY === 'YOUR_OPENWEATHERMAP_API_KEY_HERE') {
            throw new Error(
                'API key not configured. Please add your OpenWeatherMap API key to the script.js file (line 30). ' +
                'Get a free API key at https://openweathermap.org/api'
            );
        }
        
        // Build API URL
        const url = `${API_CONFIG.BASE_URL}/weather?q=${encodeURIComponent(city)}&units=${API_CONFIG.UNITS.METRIC}&appid=${API_CONFIG.KEY}`;
        
        // Make API request
        const response = await fetch(url);
        
        // Handle HTTP errors
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`City "${city}" not found. Please check the spelling and try again.`);
            } else if (response.status === 401) {
                throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
            } else if (response.status === 429) {
                throw new Error('Too many requests. Please wait a moment and try again.');
            } else {
                throw new Error(`API error: ${response.statusText}`);
            }
        }
        
        // Parse JSON response
        const data = await response.json();
        
        // Store data and update state
        appState.currentWeatherData = data;
        appState.lastSearchedCity = data.name;
        
        // Update UI with weather data
        displayWeather(data);
        
        // Clear input field after successful search
        DOM_ELEMENTS.cityInput.value = '';
        
    } catch (error) {
        handleError(error);
    } finally {
        showLoading(false);
    }
}

/**
 * Fetch weather data by coordinates (latitude, longitude)
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude
 */
async function fetchWeatherByCoordinates(latitude, longitude) {
    showLoading(true);
    clearError();
    
    try {
        // Validate API key
        if (API_CONFIG.KEY === 'YOUR_OPENWEATHERMAP_API_KEY_HERE') {
            throw new Error(
                'API key not configured. Please add your OpenWeatherMap API key to the script.js file (line 30).'
            );
        }
        
        // Build API URL with coordinates
        const url = `${API_CONFIG.BASE_URL}/weather?lat=${latitude}&lon=${longitude}&units=${API_CONFIG.UNITS.METRIC}&appid=${API_CONFIG.KEY}`;
        
        // Make API request
        const response = await fetch(url);
        
        // Handle HTTP errors
        if (!response.ok) {
            throw new Error(`Failed to fetch weather data: ${response.statusText}`);
        }
        
        // Parse JSON response
        const data = await response.json();
        
        // Store data and update state
        appState.currentWeatherData = data;
        appState.lastSearchedCity = data.name;
        
        // Update UI with weather data
        displayWeather(data);
        
    } catch (error) {
        handleError(error);
    } finally {
        showLoading(false);
    }
}

/* ============================================
   Weather Display & DOM Manipulation
   ============================================ */

/**
 * Display weather data in the UI
 * @param {object} data - Weather data from API
 */
function displayWeather(data) {
    try {
        // Hide welcome message, show weather section
        DOM_ELEMENTS.welcomeMessage.classList.add('hidden');
        DOM_ELEMENTS.weatherSection.classList.remove('hidden');
        
        // Update location and time
        DOM_ELEMENTS.locationName.textContent = `${data.name}, ${data.sys.country}`;
        DOM_ELEMENTS.weatherTime.textContent = formatCurrentTime(new Date());
        
        // Update main weather display
        const tempC = Math.round(data.main.temp);
        const tempF = Math.round((tempC * 9/5) + 32);
        
        if (appState.isCelsius) {
            DOM_ELEMENTS.temperature.textContent = tempC;
        } else {
            DOM_ELEMENTS.temperature.textContent = tempF;
        }
        
        // Weather description (capitalize first letter)
        DOM_ELEMENTS.weatherDescription.textContent = 
            data.weather[0].description.charAt(0).toUpperCase() + 
            data.weather[0].description.slice(1);
        
        // Feels like temperature
        const feelsLikeC = Math.round(data.main.feels_like);
        const feelsLikeF = Math.round((feelsLikeC * 9/5) + 32);
        DOM_ELEMENTS.feelsLike.textContent = appState.isCelsius ? feelsLikeC : feelsLikeF;
        
        // Weather icon from API
        const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
        DOM_ELEMENTS.weatherIcon.src = iconUrl;
        DOM_ELEMENTS.weatherIcon.alt = data.weather[0].main;
        
        // Update detail cards
        DOM_ELEMENTS.humidityValue.textContent = `${data.main.humidity}%`;
        DOM_ELEMENTS.windSpeedValue.textContent = `${data.wind.speed.toFixed(1)} m/s`;
        DOM_ELEMENTS.pressureValue.textContent = `${data.main.pressure} mb`;
        DOM_ELEMENTS.visibilityValue.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
        DOM_ELEMENTS.cloudsValue.textContent = `${data.clouds.all}%`;
        
        // UV Index is not available in the standard weather endpoint
        // It requires a separate API call to the One Call API
        // For now, we'll show a placeholder
        DOM_ELEMENTS.uvIndexValue.textContent = '--';
        
    } catch (error) {
        handleError(new Error('Failed to display weather data: ' + error.message));
    }
}

/**
 * Toggle temperature unit between Celsius and Fahrenheit
 */
function toggleTemperatureUnit() {
    if (!appState.currentWeatherData) return;
    
    appState.isCelsius = !appState.isCelsius;
    
    // Convert temperature
    const data = appState.currentWeatherData;
    const tempC = Math.round(data.main.temp);
    const tempF = Math.round((tempC * 9/5) + 32);
    
    DOM_ELEMENTS.temperature.textContent = appState.isCelsius ? tempC : tempF;
    
    // Convert feels like temperature
    const feelsLikeC = Math.round(data.main.feels_like);
    const feelsLikeF = Math.round((feelsLikeC * 9/5) + 32);
    DOM_ELEMENTS.feelsLike.textContent = appState.isCelsius ? feelsLikeC : feelsLikeF;
    
    // Update button text
    DOM_ELEMENTS.tempToggle.textContent = appState.isCelsius ? 'Switch to °F' : 'Switch to °C';
}

/* ============================================
   Utility Functions - UI State Management
   ============================================ */

/**
 * Show loading indicator
 * @param {boolean} show - Whether to show or hide the loading indicator
 */
function showLoading(show) {
    if (show) {
        DOM_ELEMENTS.loadingIndicator.classList.remove('hidden');
    } else {
        DOM_ELEMENTS.loadingIndicator.classList.add('hidden');
    }
}

/**
 * Show error message to user
 * @param {string} message - Error message to display
 */
function showError(message) {
    DOM_ELEMENTS.errorMessage.textContent = message;
    DOM_ELEMENTS.errorMessage.classList.remove('hidden');
    
    // Hide weather section and welcome message
    DOM_ELEMENTS.weatherSection.classList.add('hidden');
    DOM_ELEMENTS.welcomeMessage.classList.remove('hidden');
    
    // Auto-hide error after 8 seconds
    setTimeout(clearError, 8000);
}

/**
 * Clear error message
 */
function clearError() {
    DOM_ELEMENTS.errorMessage.classList.add('hidden');
    DOM_ELEMENTS.errorMessage.textContent = '';
}

/**
 * Handle errors throughout the application
 * @param {Error} error - Error object
 */
function handleError(error) {
    console.error('Error:', error);
    
    // Extract meaningful error message
    const message = error.message || 'An unexpected error occurred. Please try again.';
    showError(message);
}

/* ============================================
   Utility Functions - Formatting
   ============================================ */

/**
 * Format current time for display
 * @param {Date} date - Date object
 * @returns {string} Formatted time string
 */
function formatCurrentTime(date) {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    
    return date.toLocaleDateString('en-US', options);
}

/* ============================================
   Initialization
   ============================================ */

/**
 * Initialize the application when DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    console.log('WeatherPro Application initialized successfully');
    console.log('API Key Status:', API_CONFIG.KEY === 'YOUR_OPENWEATHERMAP_API_KEY_HERE' 
        ? '❌ NOT CONFIGURED - Please add your API key' 
        : '✅ Configured');
});

/* ============================================
   Error Handling for Unhandled Promises
   ============================================ */

/**
 * Global error handler for unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    handleError(event.reason);
});
