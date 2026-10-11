import { ancestralidadeCatalogStaticParams } from "@/lib/catalogoGenerateStaticParams";
import RegrasAncestralidadeDetailClient from "./RegrasAncestralidadeDetailClient";

export async function generateStaticParams() {
  return ancestralidadeCatalogStaticParams();
}

export default function RegrasAncestralidadeDetailPage() {
  return <RegrasAncestralidadeDetailClient />;
}
