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
  WiThunderstorm,
  WiSnow,
  WiFog,
} from 'react-icons/wi';
import './WeatherIcon.css';

// Map OpenWeatherMap icon codes to react-icons components with animation classes
const iconMap: Record<
  string,
  { Component: FC<{ size: number; title: string; className?: string }>; animation: string }
> = {
  '01d': { Component: WiDaySunny, animation: 'animate-spin-slow' }, // clear sky day
  '01n': { Component: WiNightClear, animation: 'animate-pulse-slow' }, // clear sky night
  '02d': { Component: WiDayCloudy, animation: 'animate-float' }, // few clouds day
  '02n': { Component: WiNightAltCloudy, animation: 'animate-float' }, // few clouds night
  '03d': { Component: WiCloud, animation: 'animate-float' }, // scattered clouds
  '03n': { Component: WiCloud, animation: 'animate-float' },
  '04d': { Component: WiCloudy, animation: 'animate-float' }, // broken clouds
  '04n': { Component: WiCloudy, animation: 'animate-float' },
  '09d': { Component: WiShowers, animation: 'animate-rain' }, // shower rain
  '09n': { Component: WiShowers, animation: 'animate-rain' },
  '10d': { Component: WiRain, animation: 'animate-rain' }, // rain
  '10n': { Component: WiRain, animation: 'animate-rain' },
  '11d': { Component: WiThunderstorm, animation: 'animate-storm' }, // thunderstorm
  '11n': { Component: WiThunderstorm, animation: 'animate-storm' },
  '13d': { Component: WiSnow, animation: 'animate-snow' }, // snow
  '13n': { Component: WiSnow, animation: 'animate-snow' },
  '50d': { Component: WiFog, animation: 'animate-fog' }, // mist/fog
  '50n': { Component: WiFog, animation: 'animate-fog' },
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
  const iconData = iconMap[icon] || { Component: WiCloud, animation: 'animate-float' };
  const { Component, animation } = iconData;

  return <Component size={size} title={description} className={animation} />;
};
