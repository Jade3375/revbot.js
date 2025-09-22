import type { Channel } from "revolt-api";

/**
 * Represents a channel in the API.
 * @private
 */
export type APIServerChannel = Extract<
  Channel,
  { channel_type: "TextChannel" | "VoiceChannel" }
>;
