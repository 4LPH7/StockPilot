"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Loader2, 
  X,
  FileUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  parseSpreadsheetFile,
  downloadSampleCsvTemplate,
  type ValidImportItem,
  type InvalidImportRow,
} from "@/lib/import-utils";

type ImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportItems: (items: ValidImportItem[]) => Promise<number>;
};

export function ImportDialog({
  open,
  onOpenChange,
  onImportItems,
}: ImportDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [validItems, setValidItems] = useState<ValidImportItem[]>([]);
  const [invalidRows, setInvalidRows] = useState<InvalidImportRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const resetState = () => {
    setSelectedFile(null);
    setValidItems([]);
    setInvalidRows([]);
    setTotalRows(0);
    setIsParsing(false);
    setIsImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = async (file: File) => {
    setSelectedFile(file);
    setIsParsing(true);
    try {
      const result = await parseSpreadsheetFile(file);
      setValidItems(result.validItems);
      setInvalidRows(result.invalidRows);
      setTotalRows(result.totalRows);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to parse file",
        description: err.message || "Please verify the spreadsheet format.",
      });
      resetState();
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (
        file.name.endsWith(".csv") ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls")
      ) {
        handleFileChange(file);
      } else {
        toast({
          variant: "destructive",
          title: "Unsupported File",
          description: "Please upload a .csv, .xlsx, or .xls file.",
        });
      }
    }
  };

  const handleConfirmImport = async () => {
    if (validItems.length === 0) return;
    setIsImporting(true);
    try {
      const importedCount = await onImportItems(validItems);
      toast({
        title: "Import Successful!",
        description: `Successfully added ${importedCount} items to your catalog.`,
      });
      resetState();
      onOpenChange(false);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: err.message || "An error occurred while importing items.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) resetState();
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl">Import Inventory Catalog</DialogTitle>
                <DialogDescription>
                  Upload CSV or Excel spreadsheets to bulk populate stock with pre-commit validation.
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadSampleCsvTemplate}
              className="gap-1.5 text-xs shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              Sample CSV
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {!selectedFile ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 hover:bg-muted/40 transition-colors text-center"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
                }}
              />
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <FileUp className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-sm">
                  Click to browse or drag and drop your file here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports CSV, XLSX, and XLS formats (up to 500 items per import)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB • {totalRows} total rows detected
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={resetState}
                  disabled={isImporting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {isParsing ? (
                <div className="flex items-center justify-center p-8 gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Analyzing and validating columns...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Summary Metric Pills */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border p-3 bg-background">
                      <p className="text-xs text-muted-foreground">Total Rows</p>
                      <p className="text-xl font-bold">{totalRows}</p>
                    </div>
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="h-3 w-3" /> Ready to Import
                      </p>
                      <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        {validItems.length}
                      </p>
                    </div>
                    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                      <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                        <AlertCircle className="h-3 w-3" /> Rejected Rows
                      </p>
                      <p className="text-xl font-bold text-destructive">
                        {invalidRows.length}
                      </p>
                    </div>
                  </div>

                  {/* Tabs Preview */}
                  <Tabs defaultValue={validItems.length > 0 ? "valid" : "invalid"}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="valid">
                        Valid Items ({validItems.length})
                      </TabsTrigger>
                      <TabsTrigger value="invalid">
                        Issues Found ({invalidRows.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="valid" className="mt-2">
                      <ScrollArea className="h-[220px] rounded-md border">
                        {validItems.length === 0 ? (
                          <div className="p-8 text-center text-sm text-muted-foreground">
                            No valid items found in the spreadsheet.
                          </div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-center">Quantity</TableHead>
                                <TableHead className="text-center">Threshold</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {validItems.map((item, idx) => (
                                <TableRow key={idx}>
                                  <TableCell className="font-medium text-xs">
                                    {item.name}
                                  </TableCell>
                                  <TableCell className="text-xs">
                                    <Badge variant="secondary" className="text-[10px]">
                                      {item.category}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right text-xs">
                                    ₹{item.price}
                                  </TableCell>
                                  <TableCell className="text-center text-xs">
                                    {item.quantity}
                                  </TableCell>
                                  <TableCell className="text-center text-xs">
                                    {item.lowStockThreshold ?? 10}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="invalid" className="mt-2">
                      <ScrollArea className="h-[220px] rounded-md border p-3">
                        {invalidRows.length === 0 ? (
                          <div className="p-8 text-center text-sm text-muted-foreground">
                            All rows passed validation with zero errors!
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {invalidRows.map((invalid, idx) => (
                              <div
                                key={idx}
                                className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs"
                              >
                                <div className="flex items-center justify-between font-semibold text-destructive">
                                  <span>Row #{invalid.rowNumber}</span>
                                  <span>{invalid.raw.name || invalid.raw.item || "Unnamed Item"}</span>
                                </div>
                                <ul className="mt-1.5 list-disc list-inside space-y-0.5 text-muted-foreground">
                                  {invalid.errors.map((err, eIdx) => (
                                    <li key={eIdx} className="text-destructive/90">{err}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="p-6 pt-3 border-t bg-muted/10">
          <Button
            variant="outline"
            onClick={() => {
              resetState();
              onOpenChange(false);
            }}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmImport}
            disabled={validItems.length === 0 || isImporting || isParsing}
            className="gap-2"
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Confirm & Import {validItems.length} Item{validItems.length === 1 ? "" : "s"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
