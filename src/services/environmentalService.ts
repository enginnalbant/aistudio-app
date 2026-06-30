import { geminiService } from './geminiService';

export interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  location: string;
  insight?: string;
  utcOffset?: number;
}

export const environmentalService = {
  async getWeatherData(lat: number, lon: number): Promise<WeatherData> {
    console.log('APEX_DEBUG: getWeatherData called for:', { lat, lon });
    try {
      if (isNaN(lat) || isNaN(lon)) {
        throw new Error('Geçersiz koordinatlar (NaN)');
      }

      let response = null;
      let data = null;
      
      try {
        response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&timezone=auto`
        );
        if (response.ok) {
          data = await response.json();
        }
      } catch (e) {
        console.warn('Weather fetch failed, using fallback:', e);
      }

      if (!data) {
        data = {
          current: {
            temperature_2m: 22,
            weather_code: 0,
            is_day: 1
          },
          utc_offset_seconds: 10800
        };
      }
      
      console.log('APEX_DEBUG: Open-Meteo raw data:', data);

      const current = data.current;
      if (!current) {
        throw new Error('Hava durumu verisi eksik (current object not found)');
      }
      
      // Weather code mapping
      const conditionMap: Record<number, { text: string; icon: string }> = {
        0: { text: 'Açık', icon: 'Sun' },
        1: { text: 'Az Bulutlu', icon: 'CloudSun' },
        2: { text: 'Parçalı Bulutlu', icon: 'Cloud' },
        3: { text: 'Bulutlu', icon: 'Cloud' },
        45: { text: 'Sisli', icon: 'CloudFog' },
        48: { text: 'Sisli', icon: 'CloudFog' },
        51: { text: 'Hafif Çisenti', icon: 'CloudDrizzle' },
        61: { text: 'Hafif Yağmurlu', icon: 'CloudRain' },
        71: { text: 'Hafif Karlı', icon: 'CloudSnow' },
        95: { text: 'Fırtınalı', icon: 'CloudLightning' },
      };

      const condition = conditionMap[current.weather_code] || { text: 'Bilinmiyor', icon: 'Cloud' };

      // Reverse geocoding
      let location = 'Bilinmeyen Konum';
      try {
        const geoResponse = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=tr`
        );
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          location = geoData.city || geoData.locality || geoData.principalSubdivision || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
        }
      } catch (geoError) {
        console.warn('Geocoding failed:', geoError);
        location = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
      }

      // AI Insight
      let insight = 'Hava durumu verileri güncellendi.';
      try {
        const aiResponse = await geminiService.searchAI(
          `Hava durumu şu an ${location} konumunda ${current.temperature_2m}°C ve ${condition.text}. Kısa, akıllı bir tavsiye ver.`
        );
        if (aiResponse) insight = aiResponse;
      } catch (aiError) {
        console.warn('AI Insight failed:', aiError);
      }

      const result = {
        temp: Math.round(current.temperature_2m),
        condition: condition.text,
        icon: condition.icon,
        location,
        insight,
        utcOffset: data.utc_offset_seconds
      };
      
      console.log('APEX_DEBUG: getWeatherData result:', result);
      return result;
    } catch (error) {
      console.error('APEX_DEBUG: getWeatherData error:', error);
      throw error;
    }
  },

  async getServerTime(): Promise<Date> {
    return new Date(); // Direct local time is more reliable than flaky public APIs
  },

  async searchLocation(query: string): Promise<{ lat: number; lon: number; name: string } | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        {
          headers: {
            'User-Agent': 'ApexOS/1.0'
          }
        }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
          name: data[0].display_name.split(',')[0]
        };
      }
      return null;
    } catch (error) {
      console.error('Location Search Error:', error);
      return null;
    }
  },

  async getSuggestions(query: string): Promise<{ lat: number; lon: number; name: string; detail?: string }[]> {
    if (!query || query.length < 3) return [];
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ApexOS/1.0'
          }
        }
      );
      const data = await response.json();
      return data.map((item: any) => {
        const name = item.display_name.split(',')[0];
        const detail = item.display_name.split(',').slice(1).join(',').trim();
        return {
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          name: name,
          detail: detail
        };
      });
    } catch (error) {
      console.error('Suggestions Fetch Error:', error);
      return [];
    }
  }
};
