import { classeCatalogStaticParams } from "@/lib/catalogoGenerateStaticParams";
import RegrasClasseDetailClient from "./RegrasClasseDetailClient";

export async function generateStaticParams() {
  return classeCatalogStaticParams();
}

export default function RegrasClasseDetailPage() {
  return <RegrasClasseDetailClient />;
}
