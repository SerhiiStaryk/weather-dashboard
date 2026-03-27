import type { FC } from 'react';
import {
  WiDaySunny,
  WiNightClear,
  WiDayCloudy,
  WiNightAltCloudy,
  WiCloud,
  WiCloudy,
  WiShowers,
  WiRain,
  WiDayRain,
  WiNightRain,
  WiThunderstorm,
  WiSnow,
  WiDaySnow,
  WiNightSnow,
  WiFog,
  WiDayFog,
  WiNightFog,
  WiDayShowers,
  WiNightShowers,
  WiStormShowers,
  WiHumidity,
  WiStrongWind,
} from 'react-icons/wi';
import './WeatherIcon.css';

// Map OpenWeatherMap icon codes to react-icons components with animation classes
const iconMap: Record<
  string,
  {
    Component: FC<{ size: number; title: string; className?: string }>;
    animation: string;
  }
> = {
  '01d': { Component: WiDaySunny, animation: 'animate-spin-slow' }, // clear sky day
  '01n': { Component: WiNightClear, animation: 'animate-pulse-slow' }, // clear sky night
  '02d': { Component: WiDayCloudy, animation: 'animate-float' }, // few clouds day
  '02n': { Component: WiNightAltCloudy, animation: 'animate-float' }, // few clouds night
  '03d': { Component: WiCloud, animation: 'animate-float' }, // scattered clouds
  '03n': { Component: WiCloud, animation: 'animate-float' },
  '04d': { Component: WiCloudy, animation: 'animate-float' }, // broken clouds
  '04n': { Component: WiCloudy, animation: 'animate-float' },
  '09d': { Component: WiDayShowers, animation: 'animate-rain' }, // shower rain day
  '09n': { Component: WiNightShowers, animation: 'animate-rain' }, // shower rain night
  '10d': { Component: WiDayRain, animation: 'animate-rain' }, // rain day
  '10n': { Component: WiNightRain, animation: 'animate-rain' }, // rain night
  '11d': { Component: WiStormShowers, animation: 'animate-storm' }, // thunderstorm day
  '11n': { Component: WiThunderstorm, animation: 'animate-storm' }, // thunderstorm night
  '13d': { Component: WiDaySnow, animation: 'animate-snow' }, // snow day
  '13n': { Component: WiNightSnow, animation: 'animate-snow' }, // snow night
  '50d': { Component: WiDayFog, animation: 'animate-fog' }, // mist/fog day
  '50n': { Component: WiNightFog, animation: 'animate-fog' }, // mist/fog night
};

interface WeatherIconProps {
  icon: string;
  description: string;
  size?: number;
}

export const WeatherIcon: FC<WeatherIconProps> = ({
  icon,
  description,
  size = 80,
}) => {
  const iconData = iconMap[icon] || {
    Component: WiCloud,
    animation: 'animate-float',
  };
  const { Component, animation } = iconData;

  return <Component size={size} title={description} className={animation} />;
};
