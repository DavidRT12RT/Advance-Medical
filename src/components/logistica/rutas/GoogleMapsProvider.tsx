import React from 'react';
import { Libraries, LoadScript } from '@react-google-maps/api';

const libraries: Libraries = ["drawing", "geometry", "places"];

interface GoogleMapsProviderProps {
  children: React.ReactNode;
}

const GoogleMapsProvider: React.FC<GoogleMapsProviderProps> = ({ children }) => {
  return (
    <LoadScript
      googleMapsApiKey="AIzaSyC8jGa8BQwCl8Kwc1686dHWgyjd6LYxUfk"
      libraries={libraries}
      key={Math.random()} // Force remount when switching between map types
    >
      {children}
    </LoadScript>
  );
};

export default GoogleMapsProvider;
