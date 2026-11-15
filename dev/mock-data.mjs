// Mock WeatherAPI.com /v1/current.json responses for local development only.
const presets = {
  mumbai:    ['Mumbai', 'Maharashtra', 'India', 'Asia/Kolkata', 31.8, 31.8, 'Smoky haze', 143, 34, 6.1, 4.8, 1],
  delhi:     ['New Delhi', 'Delhi', 'India', 'Asia/Kolkata', 26.1, 25.4, 'Mist', 143, 48, 5.4, 3.9, 1],
  bengaluru: ['Bangalore', 'Karnataka', 'India', 'Asia/Kolkata', 24.2, 25.1, 'Partly cloudy', 116, 61, 14.0, 5.2, 1],
  hyderabad: ['Hyderabad', 'Telangana', 'India', 'Asia/Kolkata', 29.4, 29.9, 'Sunny', 113, 40, 9.7, 7.1, 1],
  chennai:   ['Chennai', 'Tamil Nadu', 'India', 'Asia/Kolkata', 28.0, 32.6, 'Patchy light rain with thunder', 386, 83, 18.4, 3.0, 1],
  kolkata:   ['Kolkata', 'West Bengal', 'India', 'Asia/Kolkata', 27.3, 28.8, 'Haze', 143, 58, 7.2, 4.1, 1],
  pune:      ['Pune', 'Maharashtra', 'India', 'Asia/Kolkata', 29.6, 28.7, 'Sunny', 113, 29, 8.3, 6.4, 1],
  ahmedabad: ['Ahmedabad', 'Gujarat', 'India', 'Asia/Kolkata', 33.0, 31.9, 'Clear', 113, 22, 11.2, 5.8, 1],
  'new york':['New York', 'New York', 'United States of America', 'America/New_York', 9.4, 7.1, 'Light drizzle', 266, 77, 16.6, 0.4, 1],
  london:    ['London', 'City of London, Greater London', 'United Kingdom', 'Europe/London', 5.0, 3.0, 'Overcast', 122, 87, 9.0, 0.1, 1],
  oslo:      ['Oslo', 'Oslo', 'Norway', 'Europe/Oslo', -2.0, -6.3, 'Light snow', 326, 90, 12.2, 0.0, 1],
  dubai:     ['Dubai', 'Dubai', 'United Arab Emirates', 'Asia/Dubai', 36.0, 39.5, 'Sunny', 113, 30, 13.0, 8.0, 1],
};
const aliases = { bangalore: 'bengaluru', 'new delhi': 'delhi', nyc: 'new york' };

function localtime(tz) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}`;
}

export function mock(q) {
  q = q.split(',')[0].trim();
  const row = presets[aliases[q] || q];
  if (!row) return null;
  const [name, region, country, tz, t, f, text, icon, hum, wind, uv, isDay] = row;
  const c2f = (c) => +(c * 9 / 5 + 32).toFixed(1);
  return {
    location: { name, region, country, lat: 0, lon: 0, tz_id: tz, localtime_epoch: Math.floor(Date.now() / 1000), localtime: localtime(tz) },
    current: {
      last_updated: localtime(tz), temp_c: t, temp_f: c2f(t), is_day: isDay,
      condition: { text, icon: `//cdn.weatherapi.com/weather/64x64/${isDay ? 'day' : 'night'}/${icon}.png`, code: 1000 },
      wind_mph: +(wind / 1.609).toFixed(1), wind_kph: wind, wind_degree: 270, wind_dir: 'W',
      pressure_mb: 1012, pressure_in: 29.88, precip_mm: 0, precip_in: 0, humidity: hum, cloud: 25,
      feelslike_c: f, feelslike_f: c2f(f), vis_km: 4, vis_miles: 2, uv, gust_mph: 9.1, gust_kph: +(wind * 1.4).toFixed(1),
    },
  };
}
