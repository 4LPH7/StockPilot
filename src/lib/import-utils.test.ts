import { describe, it, expect } from "vitest";
import { itemImportRowSchema, parseSpreadsheetFile } from "./import-utils";
import * as XLSX from "xlsx";

describe("itemImportRowSchema", () => {
  it("validates a complete, valid item row", () => {
    const validRow = {
      name: "Smart Watch",
      category: "Wearables",
      price: 2499,
      quantity: 15,
      lowStockThreshold: 5,
      description: "Water resistant fitness tracker",
    };

    const result = itemImportRowSchema.safeParse(validRow);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Smart Watch");
      expect(result.data.category).toBe("Wearables");
      expect(result.data.price).toBe(2499);
      expect(result.data.quantity).toBe(15);
      expect(result.data.lowStockThreshold).toBe(5);
    }
  });

  it("applies defaults for optional category, threshold, and description", () => {
    const minimalRow = {
      name: "USB-C Cable",
      price: 199,
      quantity: 50,
    };

    const result = itemImportRowSchema.safeParse(minimalRow);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.category).toBe("General");
      expect(result.data.lowStockThreshold).toBe(10);
      expect(result.data.description).toBe("");
    }
  });

  it("rejects rows with missing or blank name", () => {
    const invalidRow = {
      name: "   ",
      price: 100,
      quantity: 10,
    };

    const result = itemImportRowSchema.safeParse(invalidRow);
    expect(result.success).toBe(false);
  });

  it("rejects negative price", () => {
    const invalidRow = {
      name: "Defective Item",
      price: -50,
      quantity: 10,
    };

    const result = itemImportRowSchema.safeParse(invalidRow);
    expect(result.success).toBe(false);
  });

  it("rejects negative or fractional quantity", () => {
    const negativeQty = {
      name: "Item A",
      price: 50,
      quantity: -5,
    };
    expect(itemImportRowSchema.safeParse(negativeQty).success).toBe(false);

    const floatQty = {
      name: "Item B",
      price: 50,
      quantity: 3.5,
    };
    expect(itemImportRowSchema.safeParse(floatQty).success).toBe(false);
  });
});

describe("parseSpreadsheetFile", () => {
  it("parses and normalizes CSV data containing alias headers", async () => {
    const sampleRows = [
      {
        "Product Name": "Desk Lamp",
        "Dept": "Lighting",
        "Unit Price": 1299,
        "Qty": 12,
        "Alert Threshold": 4,
        "Details": "LED desk lamp with dimmer",
      },
      {
        "Product Name": "Broken Row",
        "Unit Price": -100, // Invalid price
        "Qty": 5,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const rawBuffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    const uint8 = new Uint8Array(rawBuffer);
    const arrayBuffer = uint8.buffer.slice(uint8.byteOffset, uint8.byteOffset + uint8.byteLength);

    const file = new File([arrayBuffer], "test_import.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    file.arrayBuffer = async () => arrayBuffer;

    const parsed = await parseSpreadsheetFile(file);
    expect(parsed.totalRows).toBe(2);
    expect(parsed.validItems).toHaveLength(1);
    expect(parsed.invalidRows).toHaveLength(1);

    expect(parsed.validItems[0]).toEqual({
      name: "Desk Lamp",
      category: "Lighting",
      price: 1299,
      quantity: 12,
      lowStockThreshold: 4,
      description: "LED desk lamp with dimmer",
    });

    expect(parsed.invalidRows[0].rowNumber).toBe(3);
    expect(parsed.invalidRows[0].errors.some((e) => e.includes("price"))).toBe(true);
  });
});
