import type { Message as APIMessage, MessageSort } from "revolt-api";
import { BaseManager } from "./baseManager";
import { Channel, Message, MessageEmbed } from "../struct/index";
import { UUID } from "../utils/index";

export type MessageResolvable = Message | APIMessage | string;

export interface MessageReply {
  id: string;
  mention: boolean;
}

export interface MessageOptions {
  content?: string;
  replies?: MessageReply[];
  attachments?: string[];
  embeds?: MessageEmbed[];
}

export interface MessageEditOptions {
  content?: string;
  attachments?: string[];
  embeds?: MessageEmbed[];
}

export interface MessageSearchOptions {
  query: string;
  limit?: number;
  before?: string;
  after?: string;
  sort?: MessageSort;
}

export interface MessageQueryOptions {
  limit?: number;
  before?: string;
  after?: string;
  sort?: MessageSort;
  nearby?: string;
}

export class MessageManager extends BaseManager<Message, APIMessage> {
  holds = Message;
  constructor(protected readonly channel: Channel) {
    super(channel.client);
  }

  async send(content: MessageOptions | string): Promise<Message> {
    if (typeof content === "string") content = { content };

    const data = (await this.client.api.post(
      `/channels/${this.channel.id}/messages`,
      {
        body: { ...content, nonce: UUID.generate() },
      },
    )) as APIMessage;

    return this._add(data);
  }

  async ack(message: MessageResolvable): Promise<void> {
    const id = this.resolveId(message);
    if (!id) {
      throw new TypeError("INVALID_TYPE");
    }
    await this.client.api.put(`/channels/${this.channel.id}/ack/${id}`);
  }

  async bulkDelete(
    messages: MessageResolvable[] | number | Map<string, Message>,
  ): Promise<void> {
    let ids: string[] = [];

    if (typeof messages === "number") {
      messages = await this.fetch(messages);
      ids = messages instanceof Map ? [...messages.keys()] : [];
    } else if (messages instanceof Map) {
      ids = [...messages.keys()];
    } else {
      ids = messages.map((m) => this.resolveId(m)!).filter(Boolean);
    }

    await this.client.api.delete(`/channels/${this.channel.id}/messages/bulk`, {
      body: JSON.stringify({ ids }),
    });
  }

  async delete(message: MessageResolvable): Promise<void> {
    const id = this.resolveId(message);
    if (!id) {
      throw new TypeError("INVALID_TYPE");
    }
    console.log(id);
    await this.client.api.delete(`/channels/${this.channel.id}/messages/${id}`);
  }

  async edit(
    message: MessageResolvable,
    options: MessageEditOptions | string,
  ): Promise<void> {
    const id = this.resolveId(message);

    if (!id) {
      throw new TypeError("INVALID_TYPE");
    }

    if (typeof options === "string") options = { content: options };

    await this.client.api.patch(`/channels/${this.channel.id}/messages/${id}`, {
      body: options,
    });
  }

  async search(
    query: MessageSearchOptions | string,
  ): Promise<Map<string, Message>> {
    if (typeof query === "string") query = { query };

    const response = (await this.client.api.post(
      `/channels/${this.channel.id}/search`,
      {
        query: query as Required<MessageSearchOptions>,
      },
    )) as APIMessage[];

    return response.reduce((coll, cur) => {
      const msg = this._add(cur);
      coll.set(msg.id, msg);
      return coll;
    }, new Map<string, Message>());
  }

  fetch(message: MessageResolvable): Promise<Message>;
  fetch(query?: MessageQueryOptions): Promise<Map<string, Message>>;
  fetch(limit: number): Promise<Map<string, Message>>;
  async fetch(
    query?: MessageResolvable | MessageQueryOptions | number,
  ): Promise<Map<string, Message> | Message> {
    const id = this.resolveId(query as string);

    if (id) {
      const data = (await this.client.api.get(
        `/channels/${this.channel.id}/messages/${id}`,
      )) as APIMessage;
      return this._add(data);
    }

    if (typeof query === "number") query = { limit: query };
    else if (typeof query === "undefined") query = { limit: 100 };

    const messages = await this.client.api.get(
      `/channels/${this.channel.id}/messages`,
      { query: JSON.stringify(query as Required<MessageQueryOptions>) },
    );

    return (messages as APIMessage[]).reduce((coll, cur) => {
      const msg = this._add(cur);
      coll.set(msg.id, msg);
      return coll;
    }, new Map<string, Message>());
  }
}
