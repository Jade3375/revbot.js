import type { Server as APIServer, FieldsServer } from "revolt-api";
import { Attachment, Base, Category, ServerMember, User } from "./index";
import { client } from "../client/client";
import {
  RoleManager,
  ServerChannelManager,
  ServerMemberManager,
} from "../managers/index";
import { ServerPermissions, UUID } from "../utils/index";

export class Server extends Base {
  name!: string;
  description: string | null = null;
  ownerId!: string;
  members = new ServerMemberManager(this);
  channels = new ServerChannelManager(this);
  roles = new RoleManager(this);
  icon: Attachment | null = null;
  banner: Attachment | null = null;
  analytics = false;
  discoverable = false;
  nsfw = false;
  permissions!: ServerPermissions;
  categories = new Map<string, Category>();

  constructor(client: client, data: APIServer) {
    super(client);
    this._patch(data);
  }

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
      this.permissions = new ServerPermissions(
        data.default_permissions,
      ).freeze();
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

  get me(): ServerMember | null {
    return this.members.cache.get(this.client.user?.id as string) ?? null;
  }

  get createdAt(): Date {
    return UUID.timestampOf(this.id);
  }

  get createdTimestamp(): number {
    return this.createdAt.getTime();
  }

  get owner(): User | null {
    return this.client.users.cache.get(this.ownerId) ?? null;
  }

  ack(): Promise<void> {
    return this.client.servers.ack(this);
  }

  delete(): Promise<void> {
    return this.client.servers.delete(this);
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

  toString(): string {
    return this.name;
  }
}
