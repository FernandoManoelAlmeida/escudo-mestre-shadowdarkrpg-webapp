import { GERADOR_MODULES } from "@/lib/geradoresConfig";
import { GeradoresRouteGate } from "@/components/copyright/GeradoresRouteGate";
import { GeradorModuloClient } from "./GeradorModuloClient";

export function generateStaticParams() {
  return GERADOR_MODULES.map((m) => ({ modulo: m.slug }));
}

type PageProps = { params: Promise<{ modulo: string }> };

export default async function GeradorModuloPage({ params }: PageProps) {
  const { modulo } = await params;
  return (
    <GeradoresRouteGate>
      <GeradorModuloClient slug={modulo} />
    </GeradoresRouteGate>
  );
}
