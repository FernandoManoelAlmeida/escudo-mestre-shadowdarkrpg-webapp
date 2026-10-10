import path from "path";
import fs from "fs";
import { MagiaDetailClient } from "./MagiaDetailClient";

export async function generateStaticParams() {
  const filePath = path.join(
    process.cwd(),
    "public",
    "data",
    "catalogo",
    "magias.json",
  );
  if (!fs.existsSync(filePath)) return [];
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8")) as {
    magias: { id: string }[];
  };
  return data.magias.map((m) => ({ id: m.id }));
}

type PageProps = { params: Promise<{ id: string }> };

export default async function MagiaDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <MagiaDetailClient id={id} />;
}
