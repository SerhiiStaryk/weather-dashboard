import { FC } from 'react';
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

// Map OpenWeatherMap icon codes to react-icons components
const iconMap: Record<string, FC<{ size: number; title: string }>> = {
  '01d': ({ size, title }) => <WiDaySunny size={size} title={title} />,
  '01n': ({ size, title }) => <WiNightClear size={size} title={title} />,
  '02d': ({ size, title }) => <WiDayCloudy size={size} title={title} />,
  '02n': ({ size, title }) => <WiNightAltCloudy size={size} title={title} />,
  '03d': ({ size, title }) => <WiCloud size={size} title={title} />,
  '03n': ({ size, title }) => <WiCloud size={size} title={title} />,
  '04d': ({ size, title }) => <WiCloudy size={size} title={title} />,
  '04n': ({ size, title }) => <WiCloudy size={size} title={title} />,
  '09d': ({ size, title }) => <WiShowers size={size} title={title} />,
  '09n': ({ size, title }) => <WiShowers size={size} title={title} />,
  '10d': ({ size, title }) => <WiRain size={size} title={title} />,
  '10n': ({ size, title }) => <WiRain size={size} title={title} />,
  '11d': ({ size, title }) => <WiThunderstorm size={size} title={title} />,
  '11n': ({ size, title }) => <WiThunderstorm size={size} title={title} />,
  '13d': ({ size, title }) => <WiSnow size={size} title={title} />,
  '13n': ({ size, title }) => <WiSnow size={size} title={title} />,
  '50d': ({ size, title }) => <WiFog size={size} title={title} />,
  '50n': ({ size, title }) => <WiFog size={size} title={title} />,
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
  const IconComponent = iconMap[icon];
  if (IconComponent) {
    return <IconComponent size={size} title={description} />;
  }
  // fallback: generic cloud icon
  return <WiCloud size={size} title={description} />;
};
