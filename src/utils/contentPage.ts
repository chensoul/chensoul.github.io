import fs from "node:fs";
import path from "node:path";

export interface ContentPageData {
  frontmatter: Record<string, string>;
  content: string;
}

export function readContentPage(fileName: string): ContentPageData {
  const filePath = path.join(process.cwd(), "content/pages", fileName);
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const frontmatterMatch = fileContent.match(
    /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  );

  if (!frontmatterMatch) {
    throw new Error(`Invalid content page frontmatter: ${fileName}`);
  }

  const frontmatterStr = frontmatterMatch[1];
  const content = frontmatterMatch[2];
  const frontmatter: Record<string, string> = {};

  frontmatterStr.split("\n").forEach(line => {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (!match) return;

    const key = match[1];
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    frontmatter[key] = value;
  });

  return { frontmatter, content };
}
