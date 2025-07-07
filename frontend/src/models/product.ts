export interface Product {
  id: string;
  name: string;
  material_info: string | null;
  description: string;
  reviews: any[];
  [key: string]: any;
}

export interface ProductPreview {
  id?: string;
  image: string;
  name: string;
  description: string;
}