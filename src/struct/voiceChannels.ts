import type { Channel } from "revolt-api";
import { ServerChannel } from "./index";
import { client } from "../client/client";
import { ChannelTypes } from "../utils/index";

type APIVoiceChannel = Extract<Channel, { channel_type: "VoiceChannel" }>;

/**
 * Represents a voice channel in a server.
 *
 * @extends ServerChannel
 */
export class VoiceChannel extends ServerChannel {
  /** The type of the channel, which is always `VOICE` for voice channels. */
  readonly type = ChannelTypes.VOICE;

  /**
   * Creates a new VoiceChannel instance.
   *
   * @param {client} client - The client instance.
   * @param {APIVoiceChannel} data - The raw data for the voice channel from the API.
   */
  constructor(client: client, data: APIVoiceChannel) {
    super(client, data);
    this._patch(data);
  }

  /**
   * Updates the voice channel instance with new data from the API.
   *
   * @param {APIVoiceChannel} data - The raw data for the voice channel from the API.
   * @returns {this} The updated voice channel instance.
   * @protected
   */
  protected _patch(data: APIVoiceChannel): this {
    super._patch(data);
    return this;
  }

  /**
   * Acknowledges the voice channel.
   *
   * @throws {TypeError} Throws an error because voice channels cannot be acknowledged.
   *
   * @example
   * ```typescript
   * try {
   *   await voiceChannel.ack();
   * } catch (error) {
   *   console.error(error.message); // "Cannot ack voice channel"
   * }
   * ```
   */
  ack(): Promise<void> {
    throw new TypeError("Cannot ack voice channel");
  }
}
