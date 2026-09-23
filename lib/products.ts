export type Product = {
  name: string;
  price: string;
  size: string;
  tag: string;
  category: string;
  condition: string;
  image: string;
  available: boolean;
};

export const pieces: Product[] = [
  { name: "Linen utility jacket", price: "$68", size: "M", tag: "Just in", category: "shirt", condition: "Excellent condition", image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85", available: true },
  { name: "Soft leather loafers", price: "$54", size: "8", tag: "One only", category: "shoes", condition: "Very good condition", image: "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=900&q=85", available: true },
  { name: "Wool check trousers", price: "$42", size: "S", tag: "Vintage", category: "pants", condition: "Excellent condition", image: "https://images.unsplash.com/photo-1506629905607-d9dfd8d1bcd2?auto=format&fit=crop&w=900&q=85", available: true },
  { name: "Canvas carryall", price: "$36", size: "OS", tag: "Everyday", category: "accessories", condition: "Good condition", image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=85", available: true },
];

export const catalogueCategories = ["сите", "маица", "кошула", "блуза", "фармерки", "пантолони", "сукња", "фустан", "додатоци", "чевли"];
