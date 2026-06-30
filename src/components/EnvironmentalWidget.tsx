import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, 
  Cloud, 
  CloudSun, 
  CloudRain, 
  CloudLightning, 
  CloudSnow, 
  CloudFog, 
  CloudDrizzle,
  MapPin,
  Clock,
  Calendar,
  Sparkles,
  RefreshCw,
  Search,
  X,
  Moon,
  Wind
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { environmentalService, WeatherData } from '../services/environmentalService';

const DynamicEnvironment = ({ time, weather }: { time: Date; weather: WeatherData | null }) => {
  const hour = time.getHours();
  const isNight = hour >= 20 || hour < 6;
  const isEvening = hour >= 17 && hour < 20;
  const isMorning = hour >= 6 && hour < 10;

  // Determine base theme color
  let bgColor = "from-focus-neon/5 to-transparent";
  if (isNight) bgColor = "from-ai-night/20 to-transparent";
  if (isEvening) bgColor = "from-nrg-fire/15 to-transparent";
  if (isMorning) bgColor = "from-nrg-sun/15 to-transparent";

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Background Glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgColor} opacity-50 transition-colors duration-1000`} />
      
      {/* Dynamic Particles/Elements */}
      <AnimatePresence>
        {weather?.condition?.includes('Yağmur') && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0"
          >
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-[1px] h-4 bg-focus-neon/30"
                style={{ left: `${Math.random() * 100}%`, top: `-10%` }}
                animate={{ top: '110%' }}
                transition={{ duration: 0.5 + Math.random(), repeat: Infinity, ease: "linear", delay: Math.random() }}
              />
            ))}
          </motion.div>
        )}
        
        {isNight && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0"
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-pure-white rounded-full"
                style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.2, 1] }}
                transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const EnvironmentalWidget = () => {
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ lat: number; lon: number; name: string; detail?: string }[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [manualCoords, setManualCoords] = useState<{ lat: number; lon: number } | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const fetchWeather = useCallback(async (lat?: number, lon?: number) => {
    console.log('APEX_DEBUG: fetchWeather triggered with:', { lat, lon });
    setLoading(true);
    setError(null);
    try {
      let finalLat = lat;
      let finalLon = lon;

      // If no coordinates provided, use manualCoords or detect
      if (finalLat === undefined || finalLon === undefined) {
        if (manualCoords) {
          finalLat = manualCoords.lat;
          finalLon = manualCoords.lon;
        } else {
          try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
            });
            finalLat = pos.coords.latitude;
            finalLon = pos.coords.longitude;
          } catch (geoError) {
            console.warn('Geolocation failed, trying IP fallback...');
            try {
              const ipResponse = await fetch('https://get.geojs.io/v1/ip/geo.json');
              const ipData = await ipResponse.json();
              if (ipData && ipData.latitude) {
                finalLat = parseFloat(ipData.latitude);
                finalLon = parseFloat(ipData.longitude);
              } else {
                throw new Error('Primary IP API failed');
              }
            } catch (ipErr) {
              console.warn('Primary IP fallback failed, trying secondary...');
              try {
                const ip2Response = await fetch('https://freeipapi.com/api/json');
                const ip2Data = await ip2Response.json();
                if (ip2Data && ip2Data.latitude) {
                  finalLat = ip2Data.latitude;
                  finalLon = ip2Data.longitude;
                }
              } catch (ip2Err) {
                console.info('Location detection using IP also failed. Using default location.');
              }
            }
          }
        }
      }

      // Final fallback to Istanbul if still undefined
      if (finalLat === undefined || finalLon === undefined || isNaN(finalLat) || isNaN(finalLon)) {
        console.warn('APEX_DEBUG: Using default location (Istanbul) as final fallback');
        finalLat = 41.0082;
        finalLon = 28.9784;
      }

      const data = await environmentalService.getWeatherData(finalLat, finalLon);
      setWeather(data);
    } catch (err: any) {
      console.error('APEX_DEBUG: fetchWeather error:', err);
      setError(err.message || 'Hava durumu verisi alınamadı.');
    } finally {
      setLoading(false);
    }
  }, [manualCoords]);

  // Timer for clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (weather?.utcOffset !== undefined) {
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const targetTime = new Date(utc + (weather.utcOffset * 1000));
        setTime(targetTime);
      } else {
        setTime(now);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [weather?.utcOffset]);

  // Initial fetch and interval
  useEffect(() => {
    fetchWeather();
    const weatherTimer = setInterval(() => fetchWeather(), 1800000);
    return () => clearInterval(weatherTimer);
  }, [fetchWeather]);

  // Suggestions logic
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      setIsSearchingSuggestions(false);
      return;
    }

    setIsSearchingSuggestions(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const results = await environmentalService.getSuggestions(searchQuery);
        setSuggestions(results);
        setSelectedIndex(-1);
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Click outside search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (searchRef.current && !searchRef.current.contains(target)) {
        // Extra check for elements that might be technically outside but part of the UI
        if (!target.closest('.search-dropdown-item')) {
          setIsSearching(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLocation = useCallback((loc: { lat: number; lon: number; name: string }) => {
    console.log('APEX_DEBUG: handleSelectLocation triggered for:', loc.name);
    setManualCoords(loc);
    setIsSearching(false);
    setSearchQuery('');
    setSuggestions([]);
    setSelectedIndex(-1);
    // Call fetchWeather immediately with selected coordinates
    fetchWeather(loc.lat, loc.lon);
  }, [fetchWeather]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > -1 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      if (selectedIndex === -1) {
        // Use current location if enter pressed on empty or first option
        if (searchQuery.length === 0) {
          setManualCoords(null);
          setIsSearching(false);
          fetchWeather();
        }
      } else if (selectedIndex === 0 && searchQuery.length === 0) {
        setManualCoords(null);
        setIsSearching(false);
        fetchWeather();
      } else {
        const actualIndex = searchQuery.length === 0 ? selectedIndex - 1 : selectedIndex;
        if (suggestions[actualIndex]) {
          handleSelectLocation(suggestions[actualIndex]);
        }
      }
    } else if (e.key === 'Escape') {
      setIsSearching(false);
    }
  };

  const getWeatherIcon = (iconName: string, size = 20) => {
    const props = { size, className: "text-focus-neon drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]" };
    switch (iconName) {
      case 'Sun': return <Sun {...props} className="text-nrg-sun animate-pulse" />;
      case 'CloudSun': return <CloudSun {...props} />;
      case 'CloudRain': return <CloudRain {...props} />;
      case 'CloudLightning': return <CloudLightning {...props} />;
      case 'CloudSnow': return <CloudSnow {...props} className="animate-bounce" />;
      case 'CloudFog': return <CloudFog {...props} />;
      case 'CloudDrizzle': return <CloudDrizzle {...props} />;
      default: return <Cloud {...props} />;
    }
  };

  return (
    <motion.div 
      className="relative perspective-1000 group/env"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{ 
        rotateY: isHovered ? 8 : 0,
        rotateX: isHovered ? -2 : 0,
        z: isHovered ? 40 : 0
      }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
    >
      {/* Unified Environmental Panel */}
      <div 
        className={`
          flex items-center gap-2 lg:gap-4 px-4 py-2 rounded-2xl border transition-all duration-700 cursor-pointer relative
          ${isHovered ? 'bg-skel-matte/15 border-focus-neon/40 shadow-[0_20px_50px_-12px_rgba(37,99,235,0.25)]' : 'bg-skel-matte/5 border-skel-metal/10 shadow-none'}
        `}
        onClick={() => !isSearching && fetchWeather()}
      >
        {/* Background Effects Layer (Handles Clipping for Shine/Grid) */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <DynamicEnvironment time={time} weather={weather} />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04]" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/env:animate-[shimmer_2s_infinite]" />
        </div>

        {/* Time & Date Section */}
        <div className="flex flex-col items-start min-w-[70px] relative z-10">
          <motion.div 
            key={format(time, 'HH:mm')}
            className="text-xl lg:text-2xl font-display font-black tracking-tighter text-text-primary leading-none flex items-baseline gap-1"
          >
            {format(time, 'HH:mm')}
            <span className="text-[10px] font-mono opacity-30 animate-pulse">{format(time, 'ss')}</span>
          </motion.div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-1 h-1 rounded-full bg-focus-neon animate-pulse" />
            <span className="text-[9px] font-display font-bold text-text-primary tracking-tight uppercase opacity-80">
              {format(time, 'd MMM', { locale: tr })}
            </span>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="w-[1px] h-8 bg-gradient-to-b from-transparent via-skel-metal/20 to-transparent relative z-10" />

        {/* Weather Section */}
        <div className="relative z-[1000]" ref={searchRef}>
          <AnimatePresence mode="wait">
            {isSearching ? (
              <motion.div 
                key="search-container"
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                className="relative"
              >
                <div className="flex items-center gap-3 bg-skel-space/60 backdrop-blur-xl border border-focus-neon/30 rounded-xl px-4 py-2 shadow-[0_0_20px_rgba(37,99,235,0.1)] min-w-[240px]">
                  {isSearchingSuggestions ? (
                    <RefreshCw size={14} className="text-focus-neon animate-spin" />
                  ) : (
                    <Search size={14} className="text-text-secondary" />
                  )}
                  <input 
                    autoFocus
                    type="text"
                    placeholder="Şehir veya bölge ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="bg-transparent border-none text-xs text-text-primary outline-none flex-1 placeholder:text-text-secondary/40 font-medium"
                  />
                  <button 
                    type="button" 
                    onClick={() => setIsSearching(false)} 
                    className="text-text-secondary hover:text-crit-vivid transition-colors p-1 hover:bg-skel-matte/10 rounded-md"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Autocomplete Suggestions */}
                <AnimatePresence>
                  {(suggestions.length > 0 || searchQuery.length === 0) && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute top-full left-0 right-0 mt-3 bg-skel-space/95 backdrop-blur-3xl border border-skel-metal/20 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] overflow-hidden z-[1100] p-1.5"
                    >
                      {/* Current Location Option */}
                      <button
                        onMouseDown={(e) => {
                          console.log('APEX_DEBUG: onMouseDown for Current Location');
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          console.log('APEX_DEBUG: onClick for Current Location');
                          e.preventDefault();
                          e.stopPropagation();
                          setManualCoords(null);
                          setIsSearching(false);
                          setSearchQuery('');
                          setSuggestions([]);
                          fetchWeather();
                        }}
                        onMouseEnter={() => setSelectedIndex(0)}
                        className={`
                          w-full px-4 py-3 text-left rounded-xl transition-all flex items-center gap-3 group/curr cursor-pointer relative z-[1200] search-dropdown-item
                          ${selectedIndex === 0 ? 'bg-focus-neon/15 border border-focus-neon/20' : 'bg-transparent border border-transparent'}
                        `}
                      >
                        <div className="w-7 h-7 rounded-lg bg-focus-neon/10 flex items-center justify-center group-hover/curr:bg-focus-neon/20 transition-colors">
                          <RefreshCw size={14} className={`text-focus-neon ${isSearchingSuggestions ? 'animate-spin' : ''}`} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-focus-neon">Mevcut Konum</span>
                          <span className="text-[9px] text-text-secondary opacity-60">IP ve GPS tabanlı tespit</span>
                        </div>
                      </button>

                      <div className="h-[1px] bg-skel-metal/10 my-1.5 mx-2" />

                      {suggestions.map((loc, idx) => {
                        const isSelected = selectedIndex === (searchQuery.length === 0 ? idx + 1 : idx);
                        return (
                          <button
                            key={`${loc.lat}-${loc.lon}-${idx}`}
                            onMouseDown={(e) => {
                              console.log('APEX_DEBUG: onMouseDown for:', loc.name);
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onClick={(e) => {
                              console.log('APEX_DEBUG: onClick for:', loc.name);
                              e.preventDefault();
                              e.stopPropagation();
                              handleSelectLocation(loc);
                            }}
                            onMouseEnter={() => setSelectedIndex(searchQuery.length === 0 ? idx + 1 : idx)}
                            className={`
                              w-full px-4 py-3 text-left rounded-xl transition-all flex items-center gap-3 group/item cursor-pointer relative z-[1200] search-dropdown-item
                              ${isSelected ? 'bg-skel-matte/15 border border-skel-metal/20' : 'bg-transparent border border-transparent'}
                            `}
                          >
                            <div className="w-7 h-7 rounded-lg bg-skel-matte/10 flex items-center justify-center group-hover/item:bg-focus-neon/10 transition-colors">
                              <MapPin size={14} className={isSelected ? 'text-focus-neon' : 'text-text-secondary'} />
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <span className={`text-[11px] font-bold truncate ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>
                                {loc.name}
                              </span>
                              {loc.detail && (
                                <span className="text-[9px] text-text-secondary opacity-50 truncate">
                                  {loc.detail}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                      
                      {searchQuery.length >= 3 && suggestions.length === 0 && !isSearchingSuggestions && (
                        <div className="px-4 py-6 text-center">
                          <p className="text-[10px] text-text-secondary opacity-50 italic">Sonuç bulunamadı</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full border-2 border-focus-neon/20 border-t-focus-neon animate-spin" />
                <span className="text-[10px] label-mono opacity-50 tracking-[0.2em]">SYNCING</span>
              </motion.div>
            ) : weather ? (
              <motion.div 
                key="weather"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-3"
              >
                <div className="relative group/icon">
                  <div className="absolute inset-0 bg-focus-neon/20 blur-xl rounded-full opacity-0 group-hover/icon:opacity-100 transition-opacity" />
                  {getWeatherIcon(weather.icon, 24)}
                  <motion.div 
                    className="absolute -top-1 -right-1"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Sparkles size={8} className="text-ai-bright" />
                  </motion.div>
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-display font-black text-text-primary leading-none">
                      {weather.temp}°
                    </span>
                    <div 
                      onClick={(e) => { e.stopPropagation(); setIsSearching(true); }}
                      className="flex items-center gap-1 text-[9px] text-text-secondary bg-skel-matte/10 px-1.5 py-0.5 rounded-full border border-skel-metal/5 hover:bg-focus-neon/10 hover:border-focus-neon/30 transition-all group/loc"
                    >
                      <MapPin size={8} className="text-focus-neon" />
                      <span className="truncate max-w-[60px] font-bold">{weather.location}</span>
                      <Search size={8} className="opacity-0 group-hover/loc:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] text-text-secondary font-bold uppercase tracking-widest opacity-60">
                      {weather.condition}
                    </span>
                    {weather.temp > 25 && <Sun size={8} className="text-nrg-sun" />}
                    {weather.temp < 10 && <Wind size={8} className="text-focus-neon" />}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-[10px] text-crit-vivid label-mono flex items-center gap-2">
                {error || 'ERR_SYNC'}
                <button onClick={() => setIsSearching(true)} className="p-1.5 hover:bg-skel-matte/10 rounded-lg transition-colors">
                  <Search size={14} />
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Insight Badge (Floating) */}
        <AnimatePresence>
          {isHovered && weather?.insight && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9 }}
              className="absolute top-full right-0 mt-4 w-80 p-5 bg-skel-space/90 backdrop-blur-3xl border border-ai-bright/30 rounded-2xl shadow-[0_30px_70px_-15px_rgba(139,92,246,0.3)] z-[1000]"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-ai-bright/10 flex items-center justify-center">
                    <Sparkles size={14} className="text-ai-bright" />
                  </div>
                  <span className="text-[11px] label-mono text-ai-bright tracking-wider">Apex AI Insight</span>
                </div>
                <div className="flex gap-1">
                  <div className="w-1 h-1 rounded-full bg-grow-phosphor animate-ping" />
                  <div className="w-1 h-1 rounded-full bg-grow-phosphor opacity-50" />
                </div>
              </div>
              <p className="text-xs text-text-primary leading-relaxed font-medium italic opacity-90">
                "{weather.insight}"
              </p>
              <div className="mt-4 pt-4 border-t border-skel-metal/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-focus-neon" />
                  <span className="text-[9px] text-text-secondary font-mono">LIVE_ENVIRONMENT_DATA</span>
                </div>
                <span className="text-[9px] text-text-secondary opacity-40">v1.2.0</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
