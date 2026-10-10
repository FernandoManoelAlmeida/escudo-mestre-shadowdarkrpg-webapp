import path from "path";
import fs from "fs";
import { RegrasSectionClient } from "./RegrasSectionClient";

export async function generateStaticParams() {
  const filePath = path.join(
    process.cwd(),
    "public",
    "data",
    "escudo-shadowdark.json",
  );
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8")) as {
    index: { id: string }[];
  };
  return data.index.map((s) => ({ sectionId: s.id }));
}

type PageProps = { params: Promise<{ sectionId: string }> };

export default async function RegrasSectionPage({ params }: PageProps) {
  const { sectionId } = await params;
  return <RegrasSectionClient sectionId={sectionId} />;
}
