import * as XLSX from "xlsx";
import { z } from "zod";
import type { InventoryItem } from "@/types/inventory";

export const itemImportRowSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be <= 100 characters"),
  category: z.string().trim().min(1, "Category is required").max(50, "Category must be <= 50 characters").default("General"),
  price: z.coerce.number().min(0, "Price must be >= 0"),
  quantity: z.coerce.number().int("Quantity must be a whole number").min(0, "Quantity must be >= 0"),
  lowStockThreshold: z.coerce.number().int("Threshold must be a whole number").min(0, "Threshold must be >= 0").default(10),
  description: z.string().max(500, "Description must be <= 500 characters").optional().default(""),
});

export type ValidImportItem = Omit<InventoryItem, "id">;

export type InvalidImportRow = {
  rowNumber: number;
  raw: Record<string, any>;
  errors: string[];
};

export type ParseImportResult = {
  validItems: ValidImportItem[];
  invalidRows: InvalidImportRow[];
  totalRows: number;
};

// Normalize column headers to match expected keys
function normalizeHeaderKey(header: string): string {
  const clean = header.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (["name", "itemname", "product", "item", "title", "productname"].includes(clean)) {
    return "name";
  }
  if (["category", "dept", "department", "type", "cat"].includes(clean)) {
    return "category";
  }
  if (["price", "unitprice", "rate", "cost", "inr", "priceinr"].includes(clean)) {
    return "price";
  }
  if (["quantity", "qty", "stock", "units", "count", "quantityunits"].includes(clean)) {
    return "quantity";
  }
  if (["threshold", "lowstockthreshold", "alertthreshold", "minstock", "minimum", "alert"].includes(clean)) {
    return "lowStockThreshold";
  }
  if (["description", "desc", "details", "notes", "itemdescription"].includes(clean)) {
    return "description";
  }
  return header;
}

export async function parseSpreadsheetFile(file: File): Promise<ParseImportResult> {
  let arrayBuffer: ArrayBuffer;
  if (typeof file.arrayBuffer === "function") {
    arrayBuffer = await file.arrayBuffer();
  } else {
    arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    });
  }
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    return { validItems: [], invalidRows: [], totalRows: 0 };
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

  const validItems: ValidImportItem[] = [];
  const invalidRows: InvalidImportRow[] = [];

  rawRows.forEach((rawRow, index) => {
    const rowNumber = index + 2; // +1 for 0-index, +1 for header row
    const normalizedRow: Record<string, any> = {};

    for (const [key, val] of Object.entries(rawRow)) {
      const normalizedKey = normalizeHeaderKey(key);
      normalizedRow[normalizedKey] = val;
    }

    // Set fallback defaults if missing
    if (!normalizedRow.category) normalizedRow.category = "General";
    if (normalizedRow.lowStockThreshold === undefined || normalizedRow.lowStockThreshold === "") {
      normalizedRow.lowStockThreshold = 10;
    }

    const parseResult = itemImportRowSchema.safeParse(normalizedRow);

    if (parseResult.success) {
      validItems.push({
        name: parseResult.data.name,
        category: parseResult.data.category,
        price: Number(parseResult.data.price),
        quantity: Number(parseResult.data.quantity),
        lowStockThreshold: Number(parseResult.data.lowStockThreshold),
        description: parseResult.data.description || "",
      });
    } else {
      const errors = parseResult.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
      invalidRows.push({
        rowNumber,
        raw: rawRow,
        errors,
      });
    }
  });

  return {
    validItems,
    invalidRows,
    totalRows: rawRows.length,
  };
}

export function downloadSampleCsvTemplate() {
  const sampleData = [
    {
      "Name": "Wireless Bluetooth Mouse",
      "Category": "Electronics",
      "Price": 899,
      "Quantity": 35,
      "Threshold": 10,
      "Description": "2.4GHz optical ergonomic mouse with USB-C charging",
    },
    {
      "Name": "Mechanical Gaming Keyboard",
      "Category": "Electronics",
      "Price": 3499,
      "Quantity": 8,
      "Threshold": 12,
      "Description": "RGB backlit mechanical keyboard with blue switches",
    },
    {
      "Name": "Mesh Ergonomic Chair",
      "Category": "Furniture",
      "Price": 7999,
      "Quantity": 15,
      "Threshold": 5,
      "Description": "High-back mesh chair with lumbar support",
    },
    {
      "Name": "A5 Hardcover Journal",
      "Category": "Stationery",
      "Price": 249,
      "Quantity": 120,
      "Threshold": 25,
      "Description": "192 dotted pages, 100gsm acid-free paper",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
  XLSX.writeFile(workbook, "stockpilot_inventory_template.csv");
}
