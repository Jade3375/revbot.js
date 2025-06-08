import type { Server as APIServer, FieldsServer } from "revolt-api";
import { Attachment, Base, Category, Emoji, ServerMember, User } from "./index";
import { client } from "../client/client";
import {
  RoleManager,
  ServerChannelManager,
  ServerMemberManager,
} from "../managers/index";
import { FullPermissions, UUID } from "../utils/index";

/**
 * Represents a server (guild) in the client.
 *
 * @extends Base
 */
export class Server extends Base {
  /** The name of the server. */
  name!: string;

  /** The description of the server, or `null` if none is set. */
  description: string | null = null;

  /** The ID of the user who owns the server. */
  ownerId!: string;

  /** Manages the members of the server. */
  members = new ServerMemberManager(this);

  /** Manages the channels of the server. */
  channels = new ServerChannelManager(this);

  /** Manages the roles of the server. */
  roles = new RoleManager(this);

  /** The icon of the server, or `null` if none is set. */
  icon: Attachment | null = null;

  /** The banner of the server, or `null` if none is set. */
  banner: Attachment | null = null;

  /** Whether analytics are enabled for the server. */
  analytics = false;

  /** Whether the server is discoverable. */
  discoverable = false;

  /** Whether the server is marked as NSFW (Not Safe For Work). */
  nsfw = false;

  /** The default permissions for the server. */
  permissions!: FullPermissions;

  /** The categories in the server. */
  categories = new Map<string, Category>();

  /** the emojies associated with the server */
  emojis = new Map<string, Emoji>();

  /**
   * Creates a new Server instance.
   *
   * @param {client} client - The client instance.
   * @param {APIServer} data - The raw data for the server from the API.
   */
  constructor(client: client, data: APIServer) {
    super(client);
    this._patch(data);
  }

  /**
   * Updates the server instance with new data from the API.
   *
   * @param {APIServer} data - The raw data for the server from the API.
   * @param {FieldsServer[]} [clear=[]] - Fields to clear in the server.
   * @returns {this} The updated server instance.
   * @protected
   */
  protected _patch(data: APIServer, clear: FieldsServer[] = []): this {
    super._patch(data);

    if (Array.isArray(data.categories)) {
      this.categories.clear();
      for (const cat of data.categories) {
        const category = new Category(this, cat);
        this.categories.set(category.id, category);
      }
    }

    if (data.icon) {
      this.icon = new Attachment(this.client, data.icon);
    }

    if (data.banner) {
      this.banner = new Attachment(this.client, data.banner);
    }

    if (data.owner) {
      this.ownerId = data.owner;
    }

    if (data.name) {
      this.name = data.name;
    }

    if ("description" in data) {
      this.description = data.description ?? null;
    }

    if (Array.isArray(data.channels)) {
      for (const id of data.channels) {
        const channel = this.client.channels.cache.get(id);
        if (channel?.inServer()) this.channels.cache.set(channel.id, channel);
      }
    }

    if (typeof data.roles === "object") {
      for (const [id, raw] of Object.entries(data.roles)) {
        this.roles._add(Object.assign(raw, { id }));
      }
    }

    if (typeof data.default_permissions === "number") {
      this.permissions = new FullPermissions(data.default_permissions).freeze();
    }

    if (typeof data.analytics === "boolean") this.analytics = data.analytics;
    if (typeof data.discoverable === "boolean") {
      this.discoverable = data.discoverable;
    }
    if (typeof data.nsfw === "boolean") this.nsfw = data.nsfw;

    for (const field of clear) {
      if (field === "Icon") this.icon = null;
      if (field === "Description") this.description = null;
      if (field === "Banner") this.banner = null;
    }

    return this;
  }

  /**
   * Retrieves the current user's member instance in the server.
   *
   * @returns {ServerMember | null} The current user's member instance, or `null` if not found.
   */
  get me(): ServerMember | null {
    return this.members.cache.get(this.client.user?.id as string) ?? null;
  }

  /**
   * Gets the creation date of the server.
   *
   * @returns {Date} The date when the server was created.
   */
  get createdAt(): Date {
    return UUID.timestampOf(this.id);
  }

  /**
   * Gets the creation timestamp of the server in milliseconds.
   *
   * @returns {number} The timestamp of when the server was created.
   */
  get createdTimestamp(): number {
    return this.createdAt.getTime();
  }

  /**
   * Retrieves the owner of the server.
   *
   * @returns {User | null} The owner of the server, or `null` if not found.
   */
  get owner(): User | null {
    return this.client.users.cache.get(this.ownerId) ?? null;
  }

  //   iconURL(options?: { size: number }): string | null {
  //     return this.icon
  //       ? this.client.api.cdn.icon(this.icon.id, options?.size)
  //       : null;
  //   }

  //   bannerURL(options?: { size: number }): string | null {
  //     return this.banner
  //       ? this.client.api.cdn.banner(this.banner.id, options?.size)
  //       : null;
  //   }

  /**
   * Converts the server to a string representation.
   *
   * @returns {string} The name of the server.
   */
  toString(): string {
    return this.name;
  }
}
