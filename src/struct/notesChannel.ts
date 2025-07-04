import type { Channel as APIChannel } from "revolt-api";
import { Channel, MessageStruct, User } from "./index";
import { TextBasedChannel } from "./interfaces/baseChannel";
import { client } from "../client/client";
import {
  MessageManager,
  MessageOptions,
  MessageResolvable,
} from "../managers/index";
import { ChannelTypes } from "../utils/index";

type APINotesChannel = Extract<APIChannel, { channel_type: "SavedMessages" }>;

/**
 * Represents a notes channel, which is used for saving personal messages.
 *
 * @extends Channel
 */
export class NotesChannel extends Channel implements TextBasedChannel {
  /** The type of the channel, which is always `NOTES` for notes channels. */
  readonly type = ChannelTypes.NOTES;

  /** The ID of the user associated with the notes channel. */
  userId!: string;

  /** The ID of the last message sent in this notes channel, if any. */
  lastMessageId: string | null = null;

  /** Manages the messages in this notes channel. */
  messages = new MessageManager(this);

  /**
   * Creates a new NotesChannel instance.
   *
   * @param {client} client - The client instance.
   * @param {APINotesChannel} data - The raw data for the notes channel from the API.
   */
  constructor(client: client, data: APINotesChannel) {
    super(client);
    this._patch(data);
  }

  /**
   * Updates the notes channel instance with new data from the API.
   *
   * @param {APINotesChannel} data - The raw data for the notes channel from the API.
   * @returns {this} The updated notes channel instance.
   * @protected
   */
  protected _patch(data: APINotesChannel): this {
    super._patch(data);

    if (data.user) {
      this.userId = data.user;
    }

    return this;
  }

  /**
   * Sends a message to this notes channel.
   *
   * @param {MessageOptions | string} options - The message content or options for the message.
   * @returns {Promise<Message>} A promise that resolves with the sent message.
   *
   * @example
   * ```typescript
   * await notesChannel.send("This is a saved message.");
   * ```
   */
  send(options: MessageOptions | string): Promise<MessageStruct> {
    return this.messages.send(options);
  }

  /**
   * Deletes multiple messages from this notes channel.
   *
   * @param {MessageResolvable[] | Map<string, Message> | number} messages - The messages to delete. This can be an array of message resolvables, a map of messages, or a number indicating how many recent messages to delete.
   * @returns {Promise<void>} A promise that resolves when the messages have been successfully deleted.
   *
   * @example
   * ```typescript
   * await notesChannel.bulkDelete(5); // Deletes the last 5 messages.
   * ```
   */
  bulkDelete(
    messages: MessageResolvable[] | Map<string, MessageStruct> | number,
  ): Promise<void> {
    return this.messages.bulkDelete(messages);
  }

  /**
   * Retrieves the last message sent in this notes channel.
   *
   * @returns {Message | null} The last message, or `null` if no message exists.
   */
  get lastMessage(): MessageStruct | null {
    if (!this.lastMessageId) return null;
    return this.messages.cache.get(this.lastMessageId) ?? null;
  }

  /**
   * Retrieves the user associated with this notes channel.
   *
   * @returns {User} The user associated with the notes channel.
   */
  get user(): User {
    return this.client.user!;
  }
}
