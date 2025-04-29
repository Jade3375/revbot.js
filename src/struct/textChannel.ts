import type { Channel } from "revolt-api";
import { Message, ServerChannel } from "./index";
import { TextBasedChannel } from "./interfaces/baseChannel";
import { client } from "../client/client";
import {
  MessageManager,
  MessageOptions,
  MessageResolvable,
} from "../managers/index";
import { ChannelTypes } from "../utils/index";

type APITextChannel = Extract<Channel, { channel_type: "TextChannel" }>;

/**
 * Represents a text channel in a server.
 *
 * @extends ServerChannel
 * @implements TextBasedChannel
 */
export class TextChannel extends ServerChannel implements TextBasedChannel {
  /** The ID of the last message sent in this text channel, if any. */
  lastMessageId: string | null = null;

  /** Manages the messages in this text channel. */
  messages = new MessageManager(this);

  /** The type of the channel, which is always `TEXT` for text channels. */
  readonly type = ChannelTypes.TEXT;

  /**
   * Creates a new TextChannel instance.
   *
   * @param {client} client - The client instance.
   * @param {APITextChannel} data - The raw data for the text channel from the API.
   */
  constructor(client: client, data: APITextChannel) {
    super(client, data);
    this._patch(data);
  }

  /**
   * Updates the text channel instance with new data from the API.
   *
   * @param {APITextChannel} data - The raw data for the text channel from the API.
   * @returns {this} The updated text channel instance.
   * @protected
   */
  protected _patch(data: APITextChannel): this {
    super._patch(data);

    if (data.last_message_id) this.lastMessageId = data.last_message_id;

    return this;
  }

  /**
   * Retrieves the last message sent in this text channel.
   *
   * @returns {Message | null} The last message, or `null` if no message exists.
   */
  get lastMessage(): Message | null {
    if (!this.lastMessageId) return null;
    return this.messages.cache.get(this.lastMessageId) ?? null;
  }

  /**
   * Sends a message to this text channel.
   *
   * @param {MessageOptions | string} options - The message content or options for the message.
   * @returns {Promise<Message>} A promise that resolves with the sent message.
   *
   * @example
   * ```typescript
   * await textChannel.send("Hello, world!");
   * ```
   */
  send(options: MessageOptions | string): Promise<Message> {
    return this.messages.send(options);
  }

  /**
   * Deletes multiple messages from this text channel.
   *
   * @param {MessageResolvable[] | Map<string, Message> | number} messages - The messages to delete. This can be an array of message resolvables, a map of messages, or a number indicating how many recent messages to delete.
   * @returns {Promise<void>} A promise that resolves when the messages have been successfully deleted.
   *
   * @example
   * ```typescript
   * await textChannel.bulkDelete(10); // Deletes the last 10 messages.
   * ```
   */
  bulkDelete(
    messages: MessageResolvable[] | Map<string, Message> | number,
  ): Promise<void> {
    return this.messages.bulkDelete(messages);
  }
}
