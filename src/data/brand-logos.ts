import type { PrinterBrand } from "@/types/product";

/* Printer-brand logos (public/images/Brands), with a size that balances
   their different shapes when shown in a row */
export interface BrandLogo {
  name: string;
  logo: string;
  sizeClass: string;
}

export const BRAND_LOGOS: Record<PrinterBrand, BrandLogo> = {
  "Canon": { name: "Canon", logo: "/images/Brands/canon.png", sizeClass: "h-6 md:h-7 max-w-[95px]" },
  "Epson": { name: "Epson", logo: "/images/Brands/epson.png", sizeClass: "h-6 md:h-7 max-w-[100px]" },
  "Brother": { name: "Brother", logo: "/images/Brands/brother.webp", sizeClass: "h-6 md:h-7 max-w-[105px]" },
  "HP": { name: "HP", logo: "/images/Brands/HP.svg", sizeClass: "h-9 md:h-10 max-w-[42px]" },
  "Kyocera": { name: "Kyocera", logo: "/images/Brands/kyocera.svg", sizeClass: "h-6 md:h-7 max-w-[95px]" },
  "Dell": { name: "Dell", logo: "/images/Brands/Dell_(1989).svg", sizeClass: "h-6 md:h-7 max-w-[95px]" },
  "Samsung": { name: "Samsung", logo: "/images/Brands/Samsung.png", sizeClass: "h-6 md:h-7 max-w-[100px]" },
  "Ricoh": { name: "Ricoh", logo: "/images/Brands/ricoh.png", sizeClass: "h-5 md:h-6 max-w-[110px]" },
  "Xerox": { name: "Xerox", logo: "/images/Brands/xerox.png", sizeClass: "h-6 md:h-7 max-w-[100px]" },
  "Oki": { name: "OKI", logo: "/images/Brands/Oki_logo.svg", sizeClass: "h-6 md:h-7 max-w-[95px]" },
  "Lexmark": { name: "Lexmark", logo: "/images/Brands/Lexmark-primary-logo.svg", sizeClass: "h-5 md:h-6 max-w-[115px]" },
  "Sharp": { name: "Sharp", logo: "/images/Brands/sharp.svg", sizeClass: "h-4 md:h-5 max-w-[115px]" },
  "Panasonic": { name: "Panasonic", logo: "/images/Brands/panasonic.png", sizeClass: "h-5.5 md:h-6.5 max-w-[105px]" },
  "Pantum": { name: "Pantum", logo: "/images/Brands/pantum.png", sizeClass: "h-4 md:h-4.5 max-w-[125px]" },
  "Deli": { name: "Deli", logo: "/images/Brands/deli-seeklogo.svg", sizeClass: "h-6 md:h-7 max-w-[85px]" },
  "Lenovo": { name: "Lenovo", logo: "/images/Brands/lenovo.svg", sizeClass: "h-6 md:h-7 max-w-[90px]" },
  "Konica Minolta": { name: "Konica Minolta", logo: "/images/Brands/konica%20minolta.svg", sizeClass: "h-5.5 md:h-6.5 max-w-[110px]" },
  "Tally Dascom": { name: "Tally Dascom", logo: "/images/Brands/dascom.webp", sizeClass: "h-4 md:h-4.5 max-w-[120px]" },
  "Diebold Nixdorf": { name: "Diebold Nixdorf", logo: "/images/Brands/Diebold_Nixdorf.svg", sizeClass: "h-9 md:h-10 max-w-[55px]" },
  "Printronix": { name: "Printronix", logo: "/images/Brands/printronix.svg", sizeClass: "h-4.5 md:h-5 max-w-[115px]" },
};

/** Order used by the home slider */
export const BRAND_SLIDER_ORDER: PrinterBrand[] = ["Canon","Epson","Brother","HP","Kyocera","Dell","Samsung","Ricoh","Xerox","Oki","Lexmark","Sharp","Panasonic","Pantum","Deli","Lenovo","Konica Minolta","Tally Dascom","Diebold Nixdorf","Printronix"];
