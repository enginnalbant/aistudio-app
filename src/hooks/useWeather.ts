import { useState, useEffect } from 'react';

export interface WeatherData {
  temp: number;
  condition: 'clear' | 'cloudy' | 'rain' | 'snow' | 'storm';
  isDay: boolean;
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData>({
    temp: 20,
    condition: 'clear',
    isDay: true,
    timeOfDay: 'day',
  });

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,is_day,weather_code&timezone=auto`
        ).catch(() => null);

        let data;
        if (response && response.ok) {
          data = await response.json();
        } else {
          // Fallback mock data if fetch fails
          data = {
            current: {
              temperature_2m: 22,
              is_day: 1,
              weather_code: 0
            }
          };
        }
        
        const code = data.current.weather_code;
        let condition: WeatherData['condition'] = 'clear';
        
        if (code >= 1 && code <= 3) condition = 'cloudy';
        else if (code >= 51 && code <= 67) condition = 'rain';
        else if (code >= 71 && code <= 77) condition = 'snow';
        else if (code >= 80 && code <= 82) condition = 'rain';
        else if (code >= 95) condition = 'storm';

        const hour = new Date().getHours();
        let timeOfDay: WeatherData['timeOfDay'] = 'day';
        if (hour >= 5 && hour < 8) timeOfDay = 'dawn';
        else if (hour >= 8 && hour < 18) timeOfDay = 'day';
        else if (hour >= 18 && hour < 21) timeOfDay = 'dusk';
        else timeOfDay = 'night';

        setWeather({
          temp: data.current.temperature_2m,
          condition,
          isDay: data.current.is_day === 1,
          timeOfDay,
        });
      } catch (err) {
        console.error('Weather fetch failed:', err);
      }
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      () => fetchWeather(41.0082, 28.9784) // Default to Istanbul
    );

    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(41.0082, 28.9784)
      );
    }, 1800000); // Every 30 mins

    return () => clearInterval(interval);
  }, []);

  return weather;
}
