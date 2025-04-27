import { Base } from "./base";
import type { File } from "revolt-api";
import type { client } from "../client/client";

export class Attachment extends Base {
  filename!: string;
  type!: string;
  size!: number;
  metadata!: File["metadata"];

  constructor(client: client, data: File) {
    super(client);
    this._patch(data);
  }

  protected _patch(data: File): this {
    super._patch(data);
    if (data.filename) this.filename = data.filename;
    if (data.content_type) this.type = data.content_type;
    if (typeof data.size === "number") this.size = data.size;
    if (data.metadata) this.metadata = data.metadata;
    return this;
  }
}
