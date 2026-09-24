export type Product = {
  id: string;
  image_urls: string[];
  title: string;
  description: string | null;
  price_cents: number;
  size: string | null;
  category_id: string;
  is_available: boolean;
  created_at?: string;
};

export const catalogueCategories = ["сите", "маица", "кошула", "блуза", "фармерки", "пантолони", "сукња", "фустан", "додатоци", "чевли"];
