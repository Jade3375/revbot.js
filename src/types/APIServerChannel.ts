import type { Channel } from "revolt-api";

export type APIServerChannel = Extract<
  Channel,
  { channel_type: "TextChannel" | "VoiceChannel" }
>;
