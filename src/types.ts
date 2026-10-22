export type PhotoShape = 'portrait' | 'square' | 'circle';

export interface CardData {
  name: string;
  role: string;
  photoUrl: string | null;
  photoShape: PhotoShape;
  zoom: number; // 1.0 to 3.0
  offsetX: number; // in pixels relative to center
  offsetY: number; // in pixels relative to center
  viewOnTeqx: string; // max 320
  funFact: string; // max 160
}

export interface PresetCard {
  label: string;
  data: Partial<CardData>;
}
