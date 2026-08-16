import { open, save, ask } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

const MARKDOWN_FILTER = [{ name: "Markdown", extensions: ["md", "markdown"] }];

export async function pickOpen(): Promise<string | null> {
  const path = await open({ multiple: false, filters: MARKDOWN_FILTER });
  return typeof path === "string" ? path : null;
}

export async function pickSaveAs(defaultPath?: string): Promise<string | null> {
  const path = await save({ filters: MARKDOWN_FILTER, defaultPath });
  return path ?? null;
}

export async function readMarkdown(path: string): Promise<string> {
  return readTextFile(path);
}

export async function writeMarkdown(path: string, content: string): Promise<void> {
  return writeTextFile(path, content);
}

export function basename(path: string): string {
  return path.split(/[\\/]/).pop() ?? path;
}

export async function confirmDiscard(message: string): Promise<boolean> {
  return ask(message, { title: "Unsaved changes", kind: "warning" });
}
