import type { Channel } from "revolt-api";
import { ServerChannel } from "./index";
import { client } from "../client/client";
import { ChannelTypes } from "../utils/index";

type APIVoiceChannel = Extract<Channel, { channel_type: "VoiceChannel" }>;

export class VoiceChannel extends ServerChannel {
  readonly type = ChannelTypes.VOICE;
  constructor(client: client, data: APIVoiceChannel) {
    super(client, data);
    this._patch(data);
  }

  protected _patch(data: APIVoiceChannel): this {
    super._patch(data);
    return this;
  }

  ack(): Promise<void> {
    throw new TypeError("Cannot ack voice channel");
  }
}
