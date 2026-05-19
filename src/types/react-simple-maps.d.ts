declare module "react-simple-maps" {
  import type { ReactNode } from "react";

  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: Record<string, unknown>;
    width?: number;
    height?: number;
    className?: string;
    style?: React.CSSProperties;
    children?: ReactNode;
  }

  export const ComposableMap: React.ForwardRefExoticComponent<
    ComposableMapProps & React.RefAttributes<SVGSVGElement>
  >;

  export interface GeographyProps {
    geography: unknown;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: Record<string, React.CSSProperties>;
    className?: string;
  }

  export const Geography: React.FC<GeographyProps>;

  export interface GeographiesProps {
    geography: string | object;
    children: (arg: {
      geographies: Array<Record<string, unknown> & { rsmKey?: string }>;
    }) => ReactNode;
  }

  export const Geographies: React.FC<GeographiesProps>;

  export interface LineProps {
    from?: [number, number];
    to?: [number, number];
    coordinates?: [number, number][];
    stroke?: string;
    strokeWidth?: number;
    strokeLinecap?: "round" | "butt" | "square";
    fill?: string;
    className?: string;
    filter?: string;
  }

  export const Line: React.FC<LineProps>;

  export interface MarkerProps {
    coordinates: [number, number];
    children?: ReactNode;
    className?: string;
  }

  export const Marker: React.FC<MarkerProps>;

  export interface ZoomableGroupProps {
    center?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    translateExtent?: [[number, number], [number, number]];
    children?: ReactNode;
    className?: string;
  }

  export const ZoomableGroup: React.ForwardRefExoticComponent<
    ZoomableGroupProps & React.RefAttributes<SVGGElement>
  >;
}
