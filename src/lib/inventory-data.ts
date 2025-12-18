import type { InventoryItem } from "@/types/inventory";

export const initialInventory: InventoryItem[] = [
  {
    id: "1",
    name: "Wireless Mouse",
    description: "Ergonomic wireless mouse with a long-lasting battery.",
    quantity: 42,
    category: "Electronics",
    price: 29.99,
  },
  {
    id: "2",
    name: "Mechanical Keyboard",
    description: "RGB mechanical keyboard with blue switches.",
    quantity: 15,
    category: "Electronics",
    price: 89.99,
  },
  {
    id: "3",
    name: "Office Chair",
    description: "Ergonomic office chair with lumbar support.",
    quantity: 8,
    category: "Furniture",
    price: 250.0,
  },
  {
    id: "4",
    name: "Standing Desk",
    description: "Adjustable height standing desk, 48-inch.",
    quantity: 5,
    category: "Furniture",
    price: 499.99,
  },
  {
    id: "5",
    name: "Laptop Stand",
    description: "Aluminum laptop stand for better ergonomics.",
    quantity: 30,
    category: "Accessories",
    price: 45.5,
  },
  {
    id: "6",
    name: "USB-C Hub",
    description: "7-in-1 USB-C hub with HDMI, SD card reader, and USB 3.0 ports.",
    quantity: 25,
    category: "Accessories",
    price: 39.99,
  },
  {
    id: "7",
    name: "Notebooks (3-pack)",
    description: "A5 lined notebooks for note-taking.",
    quantity: 112,
    category: "Office Supplies",
    price: 12.99,
  },
];

export const categories = [
  "Electronics",
  "Furniture",
  "Accessories",
  "Office Supplies",
  "Other",
];
