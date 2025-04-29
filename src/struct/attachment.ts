import { Base } from "./base";
import type { File } from "revolt-api";
import type { client } from "../client/client";

/**
 * Represents an attachment, such as a file or image, in a message or channel.
 *
 * @extends Base
 */
export class Attachment extends Base {
  /** The filename of the attachment. */
  filename!: string;

  /** The MIME type of the attachment (e.g., `image/png`, `application/pdf`). */
  type!: string;

  /** The size of the attachment in bytes. */
  size!: number;

  /** Metadata associated with the attachment (e.g., dimensions for images). */
  metadata!: File["metadata"];

  /**
   * Creates a new Attachment instance.
   *
   * @param {client} client - The client instance.
   * @param {File} data - The raw data for the attachment from the API.
   */
  constructor(client: client, data: File) {
    super(client);
    this._patch(data);
  }

  /**
   * Updates the attachment instance with new data from the API.
   *
   * @param {File} data - The raw data for the attachment from the API.
   * @returns {this} The updated attachment instance.
   * @protected
   */
  protected _patch(data: File): this {
    super._patch(data);
    if (data.filename) this.filename = data.filename;
    if (data.content_type) this.type = data.content_type;
    if (typeof data.size === "number") this.size = data.size;
    if (data.metadata) this.metadata = data.metadata;
    return this;
  }
}
