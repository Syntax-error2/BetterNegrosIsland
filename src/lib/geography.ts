import geography from "../data/geography.json";
export const PROVINCES = [
  {
    slug: "negros-occidental",
    code: "1804500000",
    name: "Negros Occidental",
    note: "Includes Bacolod in the regional directory; Bacolod remains a separately coded HUC.",
  },
  {
    slug: "negros-oriental",
    code: "1804600000",
    name: "Negros Oriental",
    note: "Eastern Negros and its cities and municipalities.",
  },
  {
    slug: "siquijor",
    code: "1806100000",
    name: "Siquijor",
    note: "All six municipalities on Siquijor are part of NIR.",
  },
];
export const LOCATIONS = geography.locations;
export const GEO_SOURCE = geography;
export const localityTerm = (name: string) => name.replace(/^City of /i, "");
