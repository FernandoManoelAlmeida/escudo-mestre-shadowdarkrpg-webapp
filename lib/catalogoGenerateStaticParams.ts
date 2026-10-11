import ancestralidadesCatalog from "../public/data/catalogo/ancestralidades.json";
import classesCatalog from "../public/data/catalogo/classes.json";

export function classeCatalogStaticParams(): { id: string }[] {
  return classesCatalog.entradas.map((e) => ({ id: e.id }));
}

export function ancestralidadeCatalogStaticParams(): { id: string }[] {
  return ancestralidadesCatalog.entradas.map((e) => ({ id: e.id }));
}
