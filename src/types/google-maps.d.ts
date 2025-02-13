declare global {
  const google: {
    maps: {
      Map: new (element: Element, options?: google.maps.MapOptions) => google.maps.Map;
      Polygon: new (options?: google.maps.PolygonOptions) => google.maps.Polygon;
      ControlPosition: {
        TOP_CENTER: google.maps.ControlPosition;
      };
      event: {
        addListener: (instance: any, eventName: string, handler: Function) => google.maps.MapsEventListener;
        removeListener: (listener: google.maps.MapsEventListener) => void;
      };
      drawing: {
        OverlayType: {
          POLYGON: string;
        };
      };
      LatLng: new (lat: number, lng: number) => google.maps.LatLng;
      LatLngLiteral: {
        lat: number;
        lng: number;
      };
      MapOptions: google.maps.MapOptions;
      PolygonOptions: google.maps.PolygonOptions;
      MapsEventListener: google.maps.MapsEventListener;
    };
  };
}
