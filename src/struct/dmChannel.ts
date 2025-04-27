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

export class DMChannel extends Channel implements TextBasedChannel {
  readonly type = ChannelTypes.DM;
  active!: boolean;
  permissions = DEFAULT_PERMISSION_DM;
  messages = new MessageManager(this);
  lastMessageId: string | null = null;

  constructor(client: client, data: APIDirectChannel) {
    super(client);
    this._patch(data);
  }

  protected _patch(data: APIDirectChannel): this {
    super._patch(data);

    if (typeof data.active === "boolean") this.active = data.active;
    if (data.last_message_id) this.lastMessageId = data.last_message_id;

    return this;
  }

  get lastMessage(): Message | null {
    if (!this.lastMessageId) return null;
    return this.messages.cache.get(this.lastMessageId) ?? null;
  }

  bulkDelete(
    messages: MessageResolvable[] | Map<string, Message> | number,
  ): Promise<void> {
    return this.messages.bulkDelete(messages);
  }

  send(options: MessageOptions | string): Promise<Message> {
    return this.messages.send(options);
  }
}
