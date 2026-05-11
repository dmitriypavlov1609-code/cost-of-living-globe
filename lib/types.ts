export interface City {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  country: string;
  costScore: number;
  overallScore: number;
}

export interface CostItem {
  id: string;
  label: string;
  value: number | null;
}

export interface CostCategory {
  id: string;
  label: string;
  items: CostItem[];
}

export interface QualityScore {
  name: string;
  score: number;
  color: string;
}

export interface CityDetail extends City {
  summary: string;
  qualityScores: QualityScore[];
  costCategories: CostCategory[];
}
