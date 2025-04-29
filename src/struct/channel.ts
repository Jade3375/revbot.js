import { Base } from "./base";
import type {
  DMChannel,
  GroupChannel,
  ServerChannel,
  TextChannel,
  VoiceChannel,
} from "./index";
import { ChannelTypes, UUID } from "../utils/index";

/**
 * Represents a generic communication channel in the client.
 * This abstract class provides a base structure and common functionality
 * for all types of channels, such as text, voice, group, and server channels.
 *
 * @abstract
 * @extends Base
 *
 * @property {ChannelTypes | "UNKNOWN"} type - The type of the channel. Defaults to "UNKNOWN".
 * @property {number} createdTimestamp - The timestamp (in milliseconds) when the channel was created.
 * @property {Date} createdAt - The date and time when the channel was created.
 */
export abstract class Channel extends Base {
  type: ChannelTypes | "UNKNOWN" = "UNKNOWN";

  /**
   * Gets the timestamp (in milliseconds) when the channel was created.
   *
   * @returns {number} The timestamp of the channel's creation.
   */
  get createdTimestamp(): number {
    return this.createdAt.getTime();
  }

  /**
   * Gets the date and time when the channel was created.
   *
   * @returns {Date} The creation date of the channel.
   */
  get createdAt(): Date {
    return UUID.timestampOf(this.id);
  }

  /**
   * Deletes the current channel instance from the client's channel collection.
   *
   * This method interacts with the client's channel management system to remove
   * the channel. Once deleted, the channel will no longer be accessible through
   * the client.
   *
   * @returns {Promise<void>} A promise that resolves when the channel has been successfully deleted.
   *
   * @example
   * ```typescript
   * const channel = client.channels.get('1234567890');
   * if (channel) {
   *   await channel.delete();
   *   console.log('Channel deleted successfully.');
   * }
   * ```
   */
  delete(): Promise<void> {
    return this.client.channels.delete(this);
  }

  /**
   * Checks if the channel is a text-based channel.
   *
   * @returns {boolean} True if the channel is a text-based channel, otherwise false.
   */
  isText(): this is TextChannel | GroupChannel | DMChannel {
    return "messages" in this;
  }

  /**
   * Checks if the channel is a voice channel.
   *
   * @returns {boolean} True if the channel is a voice channel, otherwise false.
   */
  isVoice(): this is VoiceChannel {
    return this.type === ChannelTypes.VOICE;
  }

  /**
   * Checks if the channel is a group channel.
   *
   * @returns {boolean} True if the channel is a group channel, otherwise false.
   */
  isGroup(): this is GroupChannel {
    return this.type === ChannelTypes.GROUP;
  }

  /**
   * Checks if the channel is part of a server.
   *
   * @returns {boolean} True if the channel is a server channel, otherwise false.
   */
  inServer(): this is ServerChannel {
    return "serverId" in this;
  }

  /**
   * Converts the channel to a string representation.
   *
   * @returns {string} A string representation of the channel in the format `<#channelId>`.
   */
  toString(): string {
    return `<#${this.id}>`;
  }

  /**
   * Fetches the latest data for the channel from the client's channel collection.
   *
   * @param {boolean} [force=true] - Whether to force a fetch even if the channel is cached.
   * @returns {Promise<Channel>} A promise that resolves with the updated channel instance.
   */
  fetch(force = true): Promise<Channel> {
    return this.client.channels.fetch(this, { force });
  }
}
