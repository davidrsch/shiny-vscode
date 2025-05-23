import * as path from "path";
import type * as vscode from "vscode";
import type { FileContent } from "./types";

/**
 * A VSCode TextDocumentContentProvider that manages a virtual file system for
 * file previews. This provider maintains an in-memory collection of files and
 * their contents, allowing for temporary file previews without writing to disk.
 *
 * The provider supports:
 * - Adding single or multiple files with optional directory prefixing
 * - Retrieving file contents through VSCode's URI system
 * - Special handling of '/empty/' paths to represent non-existent files with
 *   empty content
 */
export class ProposedFilePreviewProvider
  implements vscode.TextDocumentContentProvider
{
  private files: Record<string, FileContent> = {};

  addFiles(files: FileContent[], prefixDir: string | null = null) {
    for (const file of files) {
      this.addFile(file, prefixDir);
    }
  }

  addFile(file: FileContent, prefixDir: string | null = null) {
    if (file.type === "binary") {
      throw new Error(
        `Binary files are not supported by ProposedFilePreviewProvider at this time: ${file.name}`
      );
    }
    const fileCopy = { ...file };
    if (prefixDir) {
      fileCopy.name = path.join(prefixDir, file.name);
    }
    this.files[fileCopy.name] = fileCopy;
  }

  provideTextDocumentContent(uri: vscode.Uri): string {
    // Explicitly handle empty file paths
    if (uri.path.startsWith("/empty/")) {
      return "";
    }

    const file = this.files[uri.path];
    if (!file) {
      return "";
    }

    return file.content;
  }
}
