import type {
  MessageStruct,
  MessageManager,
  MessageOptions,
  MessageResolvable,
} from "../../index";

/**
 * Interface representing a text-based channel, which supports sending and managing messages.
 */
export interface TextBasedChannel {
  /** Manages the messages in the channel. */
  messages: MessageManager;

  /** The ID of the last message sent in the channel, or `null` if no message exists. */
  lastMessageId: string | null;

  /** The last message sent in the channel, or `null` if no message exists. */
  lastMessage: MessageStruct | null;

  /**
   * Sends a message to the channel.
   *
   * @param {MessageOptions | string} options - The message content or options for the message.
   * @returns {Promise<Message>} A promise that resolves with the sent message.
   *
   * @example
   * ```typescript
   * await channel.send("Hello, world!");
   * ```
   */
  send(options: MessageOptions | string): Promise<MessageStruct>;

  /**
   * Deletes multiple messages from the channel.
   *
   * @param {MessageResolvable[] | Map<string, Message> | number} messages - The messages to delete. This can be an array of message resolvables, a map of messages, or a number indicating how many recent messages to delete.
   * @returns {Promise<void>} A promise that resolves when the messages have been successfully deleted.
   *
   * @example
   * ```typescript
   * await channel.bulkDelete(10); // Deletes the last 10 messages.
   * ```
   */
  bulkDelete(
    messages: MessageResolvable[] | Map<string, MessageStruct> | number,
  ): Promise<void>;
}
