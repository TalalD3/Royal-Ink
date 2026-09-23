import type { PrinterBrand, Product } from "@/types/product";

/**
 * Curated directory of official, widely-used printer models in Algeria & North Africa,
 * organized by brand.
 */
export const PRINTERS_DIRECTORY: Record<PrinterBrand, string[]> = {
  HP: [
    "HP LaserJet Pro P1102",
    "HP LaserJet Pro P1102w",
    "HP LaserJet Pro M1132 MFP",
    "HP LaserJet Pro M1212nf MFP",
    "HP LaserJet Pro M1217nfw MFP",
    "HP LaserJet Pro P1100",
    "HP LaserJet Pro P1566",
    "HP LaserJet Pro P1606dn",
    "HP LaserJet Pro M1536dnf MFP",
    "HP LaserJet P2035",
    "HP LaserJet P2035n",
    "HP LaserJet P2055",
    "HP LaserJet P2055d",
    "HP LaserJet P2055dn",
    "HP LaserJet Pro M402d",
    "HP LaserJet Pro M402dn",
    "HP LaserJet Pro M402dw",
    "HP LaserJet Pro M402n",
    "HP LaserJet Pro MFP M426dw",
    "HP LaserJet Pro MFP M426fdn",
    "HP LaserJet Pro MFP M426fdw",
    "HP LaserJet Pro M404dn",
    "HP LaserJet Pro M404dw",
    "HP LaserJet Pro M404n",
    "HP LaserJet Pro MFP M428dw",
    "HP LaserJet Pro MFP M428fdn",
    "HP LaserJet Pro MFP M428fdw",
    "HP LaserJet 1010",
    "HP LaserJet 1012",
    "HP LaserJet 1015",
    "HP LaserJet 1018",
    "HP LaserJet 1020",
    "HP LaserJet 1022",
    "HP LaserJet 1320",
    "HP LaserJet 1160",
    "HP LaserJet 1005",
    "HP LaserJet M1120 MFP",
    "HP LaserJet M1522n MFP",
    "HP LaserJet Enterprise M605n",
    "HP LaserJet Enterprise M605dn",
    "HP LaserJet Enterprise M607dn",
    "HP LaserJet Enterprise M608dn",
    "HP Color LaserJet Pro M254dw",
    "HP Color LaserJet Pro MFP M281fdw",
    "HP Color LaserJet Pro M454dn",
    "HP Color LaserJet Pro MFP M479fdw",
    "HP Smart Tank 515",
    "HP Smart Tank 530",
    "HP Smart Tank 615",
    "HP Ink Tank 315",
    "HP Ink Tank 415",
  ],

  Canon: [
    "Canon i-SENSYS LBP6000",
    "Canon i-SENSYS LBP6000B",
    "Canon i-SENSYS LBP6020",
    "Canon i-SENSYS LBP6020B",
    "Canon i-SENSYS LBP6030",
    "Canon i-SENSYS LBP6030B",
    "Canon i-SENSYS LBP6030w",
    "Canon i-SENSYS MF3010",
    "Canon i-SENSYS LBP2900",
    "Canon i-SENSYS LBP2900B",
    "Canon i-SENSYS LBP3000",
    "Canon i-SENSYS MF211",
    "Canon i-SENSYS MF212w",
    "Canon i-SENSYS MF216n",
    "Canon i-SENSYS MF217w",
    "Canon i-SENSYS MF226dn",
    "Canon i-SENSYS MF229dw",
    "Canon i-SENSYS MF231",
    "Canon i-SENSYS MF232w",
    "Canon i-SENSYS MF237w",
    "Canon i-SENSYS MF244dw",
    "Canon i-SENSYS MF247dw",
    "Canon i-SENSYS MF249dw",
    "Canon i-SENSYS LBP212dw",
    "Canon i-SENSYS LBP214dw",
    "Canon i-SENSYS LBP215x",
    "Canon i-SENSYS LBP223dw",
    "Canon i-SENSYS LBP226dw",
    "Canon i-SENSYS LBP228x",
    "Canon i-SENSYS MF421dw",
    "Canon i-SENSYS MF426dw",
    "Canon i-SENSYS MF443dw",
    "Canon i-SENSYS MF445dw",
    "Canon i-SENSYS MF446x",
    "Canon i-SENSYS MF449x",
    "Canon PIXMA G1411",
    "Canon PIXMA G2411",
    "Canon PIXMA G3411",
    "Canon PIXMA G2420",
    "Canon PIXMA G3420",
    "Canon PIXMA G6040",
    "Canon imageRUNNER 2202",
    "Canon imageRUNNER 2204",
    "Canon imageRUNNER 2206",
    "Canon imageRUNNER 2425",
    "Canon imageRUNNER 2520",
  ],

  Epson: [
    "Epson EcoTank L3110",
    "Epson EcoTank L3111",
    "Epson EcoTank L3150",
    "Epson EcoTank L3151",
    "Epson EcoTank L3156",
    "Epson EcoTank L3160",
    "Epson EcoTank L5190",
    "Epson EcoTank L1110",
    "Epson EcoTank L3210",
    "Epson EcoTank L3250",
    "Epson EcoTank L3251",
    "Epson EcoTank L3256",
    "Epson EcoTank L3260",
    "Epson EcoTank L5290",
    "Epson EcoTank L1210",
    "Epson EcoTank L6160",
    "Epson EcoTank L6170",
    "Epson EcoTank L6190",
    "Epson EcoTank L6270",
    "Epson EcoTank L6290",
    "Epson EcoTank L805",
    "Epson EcoTank L850",
    "Epson EcoTank L1800",
    "Epson EcoTank M1100",
    "Epson EcoTank M1120",
    "Epson EcoTank M2140",
    "Epson EcoTank M3170",
    "Epson WorkForce Pro WF-C5290",
    "Epson WorkForce Pro WF-C5790",
    "Epson LX-350",
    "Epson LQ-350",
    "Epson FX-890",
    "Epson LQ-690",
  ],

  Brother: [
    "Brother HL-1110",
    "Brother HL-1112",
    "Brother HL-1210W",
    "Brother HL-1212W",
    "Brother DCP-1510",
    "Brother DCP-1610W",
    "Brother MFC-1810",
    "Brother MFC-1910W",
    "Brother HL-L2300D",
    "Brother HL-L2320D",
    "Brother HL-L2340DW",
    "Brother HL-L2360DN",
    "Brother HL-L2365DW",
    "Brother DCP-L2500D",
    "Brother DCP-L2520DW",
    "Brother DCP-L2540DN",
    "Brother DCP-L2540DW",
    "Brother MFC-L2700DW",
    "Brother MFC-L2720DW",
    "Brother MFC-L2740DW",
    "Brother HL-L5100DN",
    "Brother HL-L5200DW",
    "Brother DCP-L5500DN",
    "Brother MFC-L5700DN",
    "Brother MFC-L5750DW",
    "Brother DCP-T310",
    "Brother DCP-T510W",
    "Brother DCP-T710W",
    "Brother MFC-T910DW",
    "Brother DCP-T420W",
    "Brother DCP-T520W",
  ],

  Kyocera: [
    "Kyocera ECOSYS M2040dn",
    "Kyocera ECOSYS M2540dn",
    "Kyocera ECOSYS M2640idw",
    "Kyocera ECOSYS P2040dn",
    "Kyocera ECOSYS P2235dn",
    "Kyocera ECOSYS M2135dn",
    "Kyocera ECOSYS M2635dn",
    "Kyocera ECOSYS M2735dw",
    "Kyocera FS-1040",
    "Kyocera FS-1060DN",
    "Kyocera FS-1020MFP",
    "Kyocera FS-1120MFP",
    "Kyocera FS-1025MFP",
    "Kyocera FS-1125MFP",
    "Kyocera FS-2100DN",
    "Kyocera FS-4100DN",
    "Kyocera FS-4200DN",
    "Kyocera ECOSYS M3145dn",
    "Kyocera ECOSYS M3645dn",
    "Kyocera TASKalfa 1800",
    "Kyocera TASKalfa 2200",
    "Kyocera TASKalfa 2020",
    "Kyocera TASKalfa 2320",
  ],

  Pantum: [
    "Pantum P2500",
    "Pantum P2500W",
    "Pantum P2502W",
    "Pantum M6500",
    "Pantum M6500W",
    "Pantum M6500NW",
    "Pantum M6550NW",
    "Pantum M6600NW",
    "Pantum BP5100DN",
    "Pantum BP5100DW",
    "Pantum BM5100FDN",
    "Pantum BM5100FDW",
    "Pantum P3300DN",
    "Pantum P3300DW",
    "Pantum M7100DN",
    "Pantum M7100DW",
  ],

  Ricoh: [
    "Ricoh SP 204SN",
    "Ricoh SP 211",
    "Ricoh SP 213w",
    "Ricoh SP 311DN",
    "Ricoh SP 325DNw",
    "Ricoh SP 377DNwX",
    "Ricoh IM 2702",
    "Ricoh MP 2014D",
    "Ricoh MP 2014AD",
    "Ricoh MP 2555SP",
    "Ricoh MP 3055SP",
  ],

  Xerox: [
    "Xerox Phaser 3020",
    "Xerox WorkCentre 3025",
    "Xerox Phaser 3140",
    "Xerox Phaser 3155",
    "Xerox WorkCentre 3225",
    "Xerox B210",
    "Xerox B205",
    "Xerox B215",
    "Xerox VersaLink B400",
    "Xerox VersaLink B405",
  ],

  Samsung: [
    "Samsung Xpress SL-M2020",
    "Samsung Xpress SL-M2020W",
    "Samsung Xpress SL-M2070",
    "Samsung Xpress SL-M2070F",
    "Samsung Xpress SL-M2070FW",
    "Samsung Xpress SL-M2070W",
    "Samsung ML-1640",
    "Samsung ML-1660",
    "Samsung ML-2160",
    "Samsung SCX-3200",
    "Samsung SCX-3400",
    "Samsung SCX-3405",
    "Samsung ProXpress M3820ND",
    "Samsung ProXpress M4020ND",
  ],

  "Konica Minolta": [
    "Konica Minolta bizhub 164",
    "Konica Minolta bizhub 185",
    "Konica Minolta bizhub 215",
    "Konica Minolta bizhub 206",
    "Konica Minolta bizhub 226",
    "Konica Minolta bizhub 266",
    "Konica Minolta bizhub 287",
    "Konica Minolta bizhub 367",
    "Konica Minolta bizhub C224e",
    "Konica Minolta bizhub C258",
    "Konica Minolta bizhub C308",
  ],

  Lexmark: [
    "Lexmark MS310dn",
    "Lexmark MS410dn",
    "Lexmark MX310dn",
    "Lexmark MX410de",
    "Lexmark B2236dw",
    "Lexmark MB2236adw",
    "Lexmark MS510dn",
    "Lexmark MX510de",
  ],

  Sharp: [
    "Sharp AR-5618",
    "Sharp AR-5620",
    "Sharp AR-5623",
    "Sharp AR-6020",
    "Sharp AR-6023N",
    "Sharp BP-20M22",
    "Sharp BP-20M24",
  ],

  Deli: [
    "Deli P2000",
    "Deli P2000NW",
    "Deli M2000",
    "Deli M2000NW",
  ],

  Lenovo: [
    "Lenovo LJ2205",
    "Lenovo M7206",
    "Lenovo M7206W",
  ],

  Panasonic: [
    "Panasonic KX-MB1500",
    "Panasonic KX-MB2000",
    "Panasonic KX-MB2025",
    "Panasonic KX-FL422",
  ],

  Oki: [
    "Oki B412dn",
    "Oki B432dn",
    "Oki MB472dnw",
    "Oki MB492dn",
    "Oki ML 1120",
    "Oki ML 3320",
  ],

  "Tally Dascom": [
    "Tally Dascom 1125",
    "Tally Dascom 1325",
    "Tally Dascom 2600+",
  ],

  "Diebold Nixdorf": [
    "Diebold Nixdorf TH230+",
    "Diebold Nixdorf TP07",
  ],

  Printronix: [
    "Printronix P8000",
    "Printronix P7000",
    "Printronix T8000",
  ],

  Dell: [
    "Dell B1160",
    "Dell B1160w",
    "Dell B1260dn",
    "Dell B1265dnf",
  ],
};

/** Get known printers for a specific brand */
export function getPrintersByBrand(brand: PrinterBrand): string[] {
  return PRINTERS_DIRECTORY[brand] || [];
}

/**
 * Get all known printers combined: directory + any custom printers already present
 * in the active product catalog.
 */
export function getAllPrintersList(existingProducts?: Product[]): string[] {
  const set = new Set<string>();

  // 1. Add printer PRODUCTS from database (Category: printer)
  if (existingProducts) {
    existingProducts.forEach((prod) => {
      if (prod.category === "printer") {
        if (prod.name.trim()) set.add(prod.name.trim());
        (prod.compatiblePrinters || []).forEach((pr) => {
          if (pr.trim()) set.add(pr.trim());
        });
      }
    });
  }

  // 2. Add from directory
  Object.values(PRINTERS_DIRECTORY).forEach((list) => {
    list.forEach((p) => set.add(p));
  });

  // 3. Add from products' compatiblePrinters
  if (existingProducts) {
    existingProducts.forEach((prod) => {
      (prod.compatiblePrinters || []).forEach((pr) => {
        if (pr.trim()) set.add(pr.trim());
      });
    });
  }

  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export interface PrinterSuggestion {
  name: string;
  brand: string;
  isFromSelectedBrand: boolean;
  inDatabaseCount: number;
  isPrinterProduct: boolean;
  productId?: string;
}

/**
 * Search and suggest printers matching a query string.
 * Results prioritizing:
 * 1. Matching selected brand
 * 2. Actual Printer Products registered in the database (Category: printer)
 * 3. Printers already referenced by other database items
 * 4. General verified directory models
 */
export function searchPrinterSuggestions(
  query: string,
  selectedBrand?: PrinterBrand,
  existingProducts?: Product[],
  alreadySelectedPrinters: string[] = []
): PrinterSuggestion[] {
  const selectedSet = new Set(alreadySelectedPrinters.map((p) => p.toLowerCase().trim()));
  const q = query.toLowerCase().trim();

  // Find actual printer products in database
  const printerProductsMap = new Map<string, Product>();
  if (existingProducts) {
    existingProducts.forEach((p) => {
      if (p.category === "printer") {
        printerProductsMap.set(p.name.toLowerCase().trim(), p);
        (p.compatiblePrinters || []).forEach((cp) => {
          printerProductsMap.set(cp.toLowerCase().trim(), p);
        });
      }
    });
  }

  // Count usage in existing database products
  const dbPrinterUsage = new Map<string, number>();
  if (existingProducts) {
    for (const prod of existingProducts) {
      for (const pr of prod.compatiblePrinters || []) {
        const key = pr.toLowerCase().trim();
        dbPrinterUsage.set(key, (dbPrinterUsage.get(key) || 0) + 1);
      }
    }
  }

  const allPrinters = getAllPrintersList(existingProducts);

  const results: PrinterSuggestion[] = [];

  for (const printer of allPrinters) {
    if (selectedSet.has(printer.toLowerCase().trim())) continue;

    // Guess or extract brand of this printer
    let printerBrand = "Other";
    for (const [b, list] of Object.entries(PRINTERS_DIRECTORY)) {
      if (list.includes(printer) || printer.toLowerCase().startsWith(b.toLowerCase())) {
        printerBrand = b;
        break;
      }
    }

    const matchedProd = printerProductsMap.get(printer.toLowerCase().trim());
    if (matchedProd) {
      printerBrand = matchedProd.brand;
    }

    const isMatch =
      !q ||
      printer.toLowerCase().includes(q) ||
      printerBrand.toLowerCase().includes(q);

    if (isMatch) {
      const isFromSelectedBrand =
        !!selectedBrand && printerBrand.toLowerCase() === selectedBrand.toLowerCase();
      const inDatabaseCount = dbPrinterUsage.get(printer.toLowerCase().trim()) || 0;
      const isPrinterProduct = !!matchedProd;

      results.push({
        name: printer,
        brand: printerBrand,
        isFromSelectedBrand,
        inDatabaseCount,
        isPrinterProduct,
        productId: matchedProd?.id,
      });
    }
  }

  // Sort: matching selected brand first, then actual printer products, then in DB, then alphabetically
  return results
    .sort((a, b) => {
      if (a.isFromSelectedBrand && !b.isFromSelectedBrand) return -1;
      if (!a.isFromSelectedBrand && b.isFromSelectedBrand) return 1;

      if (a.isPrinterProduct && !b.isPrinterProduct) return -1;
      if (!a.isPrinterProduct && b.isPrinterProduct) return 1;

      if (a.inDatabaseCount > 0 && b.inDatabaseCount === 0) return -1;
      if (a.inDatabaseCount === 0 && b.inDatabaseCount > 0) return 1;

      return a.name.localeCompare(b.name);
    })
    .slice(0, 16);
}
