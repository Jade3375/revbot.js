import type { Channel as APIChannel } from "revolt-api";
import { Channel, Message } from "./index";
import { TextBasedChannel } from "./interfaces/baseChannel";
import {
  client,
  MessageManager,
  MessageOptions,
  MessageResolvable,
} from "../index";
import { ChannelTypes, DEFAULT_PERMISSION_DM } from "../utils/index";

type APIDirectChannel = Extract<APIChannel, { channel_type: "DirectMessage" }>;

/**
 * Represents a direct message (DM) channel between users.
 *
 * @extends Channel
 * @implements TextBasedChannel
 */
export class DMChannel extends Channel implements TextBasedChannel {
  /** The type of the channel, which is always `DM` for direct message channels. */
  readonly type = ChannelTypes.DM;

  /** Whether the DM channel is currently active. */
  active!: boolean;

  /** The default permissions for the DM channel. */
  permissions = DEFAULT_PERMISSION_DM;

  /** Manages the messages in this DM channel. */
  messages = new MessageManager(this);

  /** The ID of the last message sent in this DM channel, if any. */
  lastMessageId: string | null = null;

  /**
   * Creates a new DMChannel instance.
   *
   * @param {client} client - The client instance.
   * @param {APIDirectChannel} data - The raw data for the DM channel from the API.
   */
  constructor(client: client, data: APIDirectChannel) {
    super(client);
    this._patch(data);
  }

  /**
   * Updates the DM channel instance with new data from the API.
   *
   * @param {APIDirectChannel} data - The raw data for the DM channel from the API.
   * @returns {this} The updated DM channel instance.
   * @protected
   */
  protected _patch(data: APIDirectChannel): this {
    super._patch(data);

    if (typeof data.active === "boolean") this.active = data.active;
    if (data.last_message_id) this.lastMessageId = data.last_message_id;

    return this;
  }

  /**
   * Retrieves the last message sent in this DM channel.
   *
   * @returns {Message | null} The last message, or `null` if no message exists.
   */
  get lastMessage(): Message | null {
    if (!this.lastMessageId) return null;
    return this.messages.cache.get(this.lastMessageId) ?? null;
  }

  /**
   * Deletes multiple messages from this DM channel.
   *
   * @param {MessageResolvable[] | Map<string, Message> | number} messages - The messages to delete. This can be an array of message resolvables, a map of messages, or a number indicating how many recent messages to delete.
   * @returns {Promise<void>} A promise that resolves when the messages have been successfully deleted.
   *
   * @example
   * ```typescript
   * await dmChannel.bulkDelete(10); // Deletes the last 10 messages.
   * ```
   */
  bulkDelete(
    messages: MessageResolvable[] | Map<string, Message> | number,
  ): Promise<void> {
    return this.messages.bulkDelete(messages);
  }

  /**
   * Sends a message to this DM channel.
   *
   * @param {MessageOptions | string} options - The message content or options for the message.
   * @returns {Promise<Message>} A promise that resolves with the sent message.
   *
   * @example
   * ```typescript
   * await dmChannel.send("Hello, world!");
   * ```
   */
  send(options: MessageOptions | string): Promise<Message> {
    return this.messages.send(options);
  }
}
