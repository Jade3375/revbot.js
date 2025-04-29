import type { Category as APICategory } from "revolt-api";
import { Base, Server, ServerChannel } from "./index";

/**
 * Represents a category in a server, which groups multiple channels together.
 *
 * @extends Base
 */
export class Category extends Base {
  /** The name of the category. */
  name!: string;

  /** An array of channel IDs that belong to this category. */
  protected _children: string[] = [];

  /**
   * Creates a new Category instance.
   *
   * @param {Server} server - The server this category belongs to.
   * @param {APICategory} data - The raw data for the category from the API.
   */
  constructor(
    public readonly server: Server,
    data: APICategory,
  ) {
    super(server.client);
    this._patch(data);
  }

  /**
   * Updates the category instance with new data from the API.
   *
   * @param {APICategory} data - The raw data for the category from the API.
   * @returns {this} The updated category instance.
   * @protected
   */
  protected _patch(data: APICategory): this {
    super._patch(data);

    if (data.title) {
      this.name = data.title;
    }

    if (Array.isArray(data.channels)) {
      this._children = data.channels;
    }

    return this;
  }

  /**
   * Retrieves the channels that belong to this category.
   *
   * @returns {Map<string, ServerChannel>} A map of channel IDs to their corresponding `ServerChannel` instances.
   */
  get children(): Map<string, ServerChannel> {
    const coll = new Map<string, ServerChannel>();

    for (const childId of this._children) {
      const child = this.server.channels.cache.get(childId);
      if (child) coll.set(child.id, child);
    }

    return coll;
  }

  /**
   * Converts the category to a string representation.
   *
   * @returns {string} The name of the category.
   */
  toString(): string {
    return this.name;
  }
}
