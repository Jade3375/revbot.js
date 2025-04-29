import { Base } from "./base";
import type { Invite as APIInvite } from "revolt-api";
import type { Server, User } from "./index";
import type { client } from "../client/client";

/**
 * Represents an invite to a server or channel.
 *
 * @extends Base
 */
export class Invite extends Base {
  /** The ID of the server associated with the invite, if any. */
  serverId: string | null = null;

  /** The ID of the user who created the invite. */
  inviterId!: string;

  /** The ID of the channel associated with the invite. */
  channelId!: string;

  /**
   * Creates a new Invite instance.
   *
   * @param {client} client - The client instance.
   * @param {APIInvite} data - The raw data for the invite from the API.
   */
  constructor(client: client, data: APIInvite) {
    super(client);
    this._patch(data);
  }

  /**
   * Updates the invite instance with new data from the API.
   *
   * @param {APIInvite} data - The raw data for the invite from the API.
   * @returns {this} The updated invite instance.
   * @protected
   */
  protected _patch(data: APIInvite): this {
    super._patch(data);

    if (data.channel) this.channelId = data.channel;
    if (data.creator) this.inviterId = data.channel;

    return this;
  }

  /**
   * Retrieves the server associated with the invite.
   *
   * @returns {Server | null} The server associated with the invite, or `null` if not found.
   */
  get server(): Server | null {
    return this.client.servers.cache.get(this.serverId!) ?? null;
  }

  /**
   * Retrieves the channel associated with the invite.
   *
   * @returns {Channel | null} The channel associated with the invite, or `null` if not found.
   */
  get channel() {
    return this.client.channels.cache.get(this.channelId) ?? null;
  }

  /**
   * Retrieves the user who created the invite.
   *
   * @returns {User | null} The user who created the invite, or `null` if not found.
   */
  get inviter(): User | null {
    return this.client.users.cache.get(this.inviterId) ?? null;
  }

  //   toString(): string {
  //     return this.client.api.cdn.invite(this.id);
  //   }
}
