import { Base } from "./base";
import { client } from "../client/client";

/**
 * Represents an emoji in the client.
 *
 * @extends Base
 */
export class Emoji extends Base {
  /** The parent object of the emoji, which can be a server or other entity. */
  parent?: { type: string; id: string } | null = null;

  /** The ID of the user who created the emoji, or `null` if not available. */
  creator_id?: string | null = null;

  /** The name of the emoji, or `null` if not set. */
  name?: string | null = null;

  /**
   * Creates a new Emoji instance.
   *
   * @param {client} client - The client instance.
   * @param {Emoji} data - The raw data for the emoji.
   */
  constructor(client: client, data: Emoji) {
    super(client);
    this._patch(data);
  }

  /**
   * Retrieves the user who created the emoji.
   *
   * @returns {User | null} The creator of the emoji, or `null` if not found.
   */
  get creator() {
    return this.client.users.cache.get(this.creator_id!) ?? null;
  }

  /**
   * Retrieves the server associated with the emoji, if any.
   *
   * @returns {Server | null} The server instance, or `null` if the emoji is not associated with a server.
   */
  get server() {
    if (!this.parent) return null;
    return this.client.servers.cache.get(this.parent.id) ?? null;
  }
}
