import Endpoints, { fetchEndpoint, FileType } from "./endpoints";

export default class File {
  constructor(
    fileType: FileType,
    filename: string,
    isNewFile: boolean = false
  ) {
    this.fileType = fileType;
    this.filename = filename;
    this.isNewFile = isNewFile;
  }

  static Create(fileType: FileType, filename: string) {
    return new File(fileType, filename, true);
  }

  async getContent() {
    if (this.isNewFile) return "";
    if (this.content !== undefined) return this.content;

    return await fetchEndpoint(
      Endpoints.FileContent(this.fileType, this.filename)
    )
      .then((r) => r.text())
      .then((content) => {
        this.content = content;
        return content;
      });
  }

  setContent(content: string) {
    this.content = content;
  }

  getFilename() {
    return this.filename;
  }

  getType() {
    return this.fileType;
  }

  loaded() {
    return this.isNewFile || this.content !== undefined;
  }

  async updateRemote() {
    if (this.content === undefined) return;
    await fetchEndpoint(Endpoints.FileContent(this.fileType, this.filename), {
      method: "PUT",
      body: this.content,
      headers: {
        "Content-Type": "application/yaml",
      },
    });
    this.isNewFile = false;
  }

  private filename: string;
  private fileType: FileType;
  private isNewFile: boolean;
  private content: string | undefined;
}

export type Files = Record<FileType, File[]>;
export const configFile: File = new File("config", "config.yml");
export const placeholderFiles: Files = {
  config: [],
  provider: [],
  middleware: [],
};

export async function getConfigFiles() {
  return await fetchEndpoint(Endpoints.LIST_FILES)
    .then((r) => r.json())
    .then((files: Record<string, string[]>) => {
      return Object.entries(files).reduce((acc, [fileType, filenames]) => {
        let t = fileType as FileType;
        acc[t] = filenames.map((f) => new File(t, f));
        return acc;
      }, {} as Files);
    });
}
