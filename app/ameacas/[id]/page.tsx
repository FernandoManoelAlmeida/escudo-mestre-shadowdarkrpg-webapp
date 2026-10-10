import path from "path";
import fs from "fs";
import { AmeacaDetailClient } from "./AmeacaDetailClient";

export async function generateStaticParams() {
  const filePath = path.join(process.cwd(), "public", "data", "ameacas.json");
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8")) as {
    ameacas: { id: string }[];
  };
  return data.ameacas.map((a) => ({ id: a.id }));
}

type PageProps = { params: Promise<{ id: string }> };

export default async function AmeacaDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <AmeacaDetailClient id={id} />;
}
