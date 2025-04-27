import type { Channel as APIChannel, FieldsChannel } from "revolt-api";
import { Attachment, Category, Channel, Invite, Server } from "./index";
import { client } from "../client/client";
import { ChannelPermissions } from "../utils/index";

type APIServerChannel = Extract<
  APIChannel,
  { channel_type: "TextChannel" | "VoiceChannel" }
>;

export interface Overwrite {
  allow: ChannelPermissions;
  deny: ChannelPermissions;
}

export class ServerChannel extends Channel {
  name!: string;
  serverId!: string;
  description: string | null = null;
  icon: Attachment | null = null;
  overwrites = new Map<string, Overwrite>();
  nsfw = false;
  constructor(client: client, data: APIServerChannel) {
    super(client);
    this._patch(data);
  }

  protected _patch(data: APIServerChannel, clear: FieldsChannel[] = []): this {
    super._patch(data);

    if (data.name) this.name = data.name;

    if (data.server) this.serverId = data.server;

    if ("description" in data) this.description = data.description ?? null;

    if (data.icon) this.icon = new Attachment(this.client, data.icon);

    if (typeof data.nsfw === "boolean") this.nsfw = data.nsfw;

    if (data.role_permissions) {
      this.overwrites.clear();
      for (const [id, { a, d }] of Object.entries(data.role_permissions)) {
        this.overwrites.set(id, {
          allow: new ChannelPermissions(a),
          deny: new ChannelPermissions(d),
        });
      }
    }

    for (const field of clear) {
      if (field === "Icon") this.icon = null;
      if (field === "Description") this.description = null;
    }

    return this;
  }

  async createInvite(): Promise<Invite> {
    const data = await this.client.api.post(`/channels/${this.id}/invites`, {});
    return new Invite(
      this.client,
      data as
        | {
            type: "Server";
            _id: string;
            server: string;
            creator: string;
            channel: string;
          }
        | { type: "Group"; _id: string; creator: string; channel: string },
    );
  }

  //   iconURL(options?: { size: number }): string | null {
  //     return this.icon
  //       ? this.client.api.cdn.icon(this.icon.id, options?.size)
  //       : null;
  //   }

  get server(): Server {
    return this.client.servers.cache.get(this.serverId)!;
  }

  get category(): Category | null {
    return (
      Array.from(this.server.categories.values()).find((cat) =>
        cat.children.has(this.id),
      ) ?? null
    );
  }
}
