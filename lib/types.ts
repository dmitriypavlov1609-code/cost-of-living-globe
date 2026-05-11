export interface CityCosts {
  rent1br: number;
  rent3br: number;
  meal: number;
  mealMid: number;
  groceries: number;
  transport: number;
  utilities: number;
  internet: number;
  salary: number;
}

export interface City {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  country: string;
  costScore: number;
  overallScore: number;
  costs?: CityCosts;
}
