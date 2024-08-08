import Endpoints, { checkResponse, fetchEndpoint } from "./endpoints";

export default class ConfigFile {

    constructor(filename: string, isNewFile: boolean = false) {
        this.filename = filename;
        this.isNewFile = isNewFile;
    }

    static Create(filename: string) {
        return new ConfigFile(filename, true);
    }

    async getContent() {
        if (this.isNewFile) return '';
        if (this.content !== undefined) return this.content;

        const response = await fetchEndpoint(Endpoints.FileContent(this.filename));
        await checkResponse(response);
        return await response.text();
    };

    setContent(content: string) {
        this.content = content;
    };

    getFilename() {
        return this.filename;
    }

    async updateRemote() {
        if (this.content === undefined) return;
        const response = await fetchEndpoint(Endpoints.FileContent(this.filename), {
            method: "PUT",
            body: this.content,
            headers: {
                "Content-Type": "application/yaml"
            }
        });
        await checkResponse(response);
        this.isNewFile = false;
    };

    private filename: string
    private isNewFile: boolean
    private content: string | undefined = undefined
}