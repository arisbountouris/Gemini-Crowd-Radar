export interface Place {
  id: string;
  name: string;
  crowdLevel: number; // 0-100
  crowdLabel: 'Low' | 'Moderate' | 'High' | 'Severe';
  description: string;
  category: string;
  googleMapsUri?: string;
  address?: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export enum ViewMode {
  GRID = 'GRID',
  LIST = 'LIST'
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: unknown;
  };
}