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

export class TextChannel extends ServerChannel implements TextBasedChannel {
  lastMessageId: string | null = null;
  messages = new MessageManager(this);
  readonly type = ChannelTypes.TEXT;
  constructor(client: client, data: APITextChannel) {
    super(client, data);
    this._patch(data);
  }

  protected _patch(data: APITextChannel): this {
    super._patch(data);

    if (data.last_message_id) this.lastMessageId = data.last_message_id;

    return this;
  }

  get lastMessage(): Message | null {
    if (!this.lastMessageId) return null;
    return this.messages.cache.get(this.lastMessageId) ?? null;
  }

  send(options: MessageOptions | string): Promise<Message> {
    return this.messages.send(options);
  }

  bulkDelete(
    messages: MessageResolvable[] | Map<string, Message> | number,
  ): Promise<void> {
    return this.messages.bulkDelete(messages);
  }
}
