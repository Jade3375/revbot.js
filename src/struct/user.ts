import { Attachment, Base, DMChannel, Presence, Status } from "./index";
import type {
  User as APIUser,
  FieldsUser,
  Channel as APIChannel,
} from "revolt-api";
import { client } from "../client/client";
import { Badges, UUID } from "../utils/index";

/**
 * Represents a user in the client.
 *
 * @extends Base
 */
export class User extends Base {
  /** The username of the user. */
  username!: string;

  /** The avatar of the user, or `null` if none is set. */
  avatar: Attachment | null = null;

  /** The presence status of the user. */
  presence = new Presence(this.client);

  /** The badges associated with the user. */
  badges!: Badges;

  /** Whether the user is a bot. */
  bot = false;

  /**
   * Creates a new User instance.
   *
   * @param {client} client - The client instance.
   * @param {APIUser} data - The raw data for the user from the API.
   */
  constructor(client: client, data: APIUser) {
    super(client);
    this._patch(data);
  }

  /**
   * Updates the user instance with new data from the API.
   *
   * @param {APIUser} data - The raw data for the user from the API.
   * @param {FieldsUser[]} [clear=[]] - Fields to clear in the user.
   * @returns {this} The updated user instance.
   * @protected
   */
  protected _patch(data: APIUser, clear: FieldsUser[] = []): this {
    super._patch(data);

    if (data.username) {
      this.username = data.username;
    }

    if (data.bot) {
      this.bot = true;
    }

    if (typeof data.badges === "number") {
      this.badges = new Badges(data.badges).freeze();
    }

    if (data.avatar) {
      this.avatar = new Attachment(this.client, data.avatar);
    }

    if (data.status) {
      this.presence.status = data.status.presence
        ? (Status[data.status.presence as keyof typeof Status] ??
          Status.Invisible)
        : Status.Invisible;
      this.presence.text = data.status.text ?? null;
    }

    for (const field of clear) {
      if (field === "Avatar") this.avatar = null;
      if (field === "StatusText") this.presence.text = null;
      if (field === "StatusPresence") this.presence.status = Status.Invisible;
    }

    return this;
  }

  /**
   * Gets the creation date of the user.
   *
   * @returns {Date} The date when the user was created.
   */
  get createdAt(): Date {
    return UUID.timestampOf(this.id);
  }

  /**
   * checks if the user is the owner of the bot.
   */
  get isOwner(): boolean {
    return this.id === this.client.user?.owner;
  }

  /**
   * Gets the creation timestamp of the user in milliseconds.
   *
   * @returns {number} The timestamp of when the user was created.
   */
  get createdTimestamp(): number {
    return this.createdAt.getTime();
  }

  /**
   * Blocks the user.
   *
   * @returns {Promise<void>} A promise that resolves when the user is blocked.
   *
   * @example
   * ```typescript
   * await user.block();
   * ```
   */
  async block(): Promise<void> {
    await this.client.api.put(`/users/${this.id}/block`);
  }

  /**
   * Unblocks the user.
   *
   * @returns {Promise<void>} A promise that resolves when the user is unblocked.
   *
   * @example
   * ```typescript
   * await user.unblock();
   * ```
   */
  async unblock(): Promise<void> {
    await this.client.api.delete(`/users/${this.id}/block`);
  }

  /**
   * Creates a direct message (DM) channel with the user.
   *
   * @returns {Promise<DMChannel>} A promise that resolves with the created DM channel.
   *
   * @example
   * ```typescript
   * const dmChannel = await user.createDM();
   * ```
   */
  async createDM(): Promise<DMChannel> {
    const data = await this.client.api.get(`/users/${this.id}/dm`);
    return this.client.channels._add(data as APIChannel) as DMChannel;
  }

  avatarURL(): string | undefined {
    if (!this.avatar?.id) return undefined;
    return `${this.client.options.rest?.instanceCDNURL}/avatars/${this.avatar?.id}`;
  }

   async displayAvatarURL(): Promise<string> {
    const defaultAvatar = `${this.client.options.rest?.instanceCDNURL}/users/${this.id}/default_avatar`;
    return this.avatarURL() ?? defaultAvatar;
  }

  /**
   * Fetches the latest data for the user from the API.
   *
   * @param {boolean} [force=false] - Whether to force a fetch even if the user is cached.
   * @returns {Promise<User>} A promise that resolves with the updated user instance.
   */
  fetch(force: boolean = false): Promise<User> {
    return this.client.users.fetch(this, { force });
  }

  /**
   * Converts the user to a string representation.
   *
   * @returns {string} A string representation of the user in the format `<@userId>`.
   */
  toString(): string {
    return `<@${this.id}>`;
  }
}
