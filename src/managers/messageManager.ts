import type { Message as APIMessage, MessageSort } from "revolt-api";
import { ReadStream } from "fs";
import FormData = require("form-data");
import axios from "axios";
import { BaseManager } from "./baseManager";
import { Channel, Emoji, Message, MessageEmbed } from "../struct/index";
import { UUID } from "../utils/index";
import { CDNAttachmentResponce } from "../utils/types";

export type MessageResolvable = Message | APIMessage | string;

export interface MessageReply {
  id: string;
  mention: boolean;
}

export interface MessageOptions {
  content?: string;
  replies?: MessageReply[];
  attachments?: ReadStream[] | string[] | File[];
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

  /**
   *
   * @param content The content to send. Can be a string or an object with the following properties:
   * - content: The content of the message
   * - replies: An array of message IDs to reply to
   * - attachments: An array of attachment URLs, Files, or ReadStreams
   * - embeds: An array of MessageEmbed objects
   * @returns Promise that resolves to the sent message
   */
  async send(content: MessageOptions | string): Promise<Message> {
    if (typeof content === "string") content = { content };
    let attachments: string[] = [];
    const data = new FormData();

    if (Array.isArray(content.attachments)) {
      const promices = content.attachments.map(async (att) => {
        if (typeof att === "string") {
          const readableStream = (await axios.get(att, {
            responseType: "stream",
          })) as { data: ReadStream };
          data.append("file", readableStream.data, {
            filename: att.split("/").pop(),
          });
        }

        if (att instanceof ReadStream) {
          data.append("file", att);
        }

        if (att instanceof File) {
          const buffer = Buffer.from(await att.arrayBuffer());
          data.append("file", buffer, { filename: att.name });
        }

        await this.client.cdn.post("/attachments", data).then((attachment) => {
          const { id } = attachment as CDNAttachmentResponce;
          attachments.push(id);
        });
      });
      await Promise.all(promices);
    }

    const resp = (await this.client.api.post(
      `/channels/${this.channel.id}/messages`,
      {
        body: { ...content, attachments, nonce: UUID.generate() },
      },
    )) as APIMessage;
    return this._add(resp);
  }

  /**
   * acknowledge a message to mark it as read (not important for bots)
   * @param message The message to acknowledge
   * @returns Promise that resolves when the message is acknowledged
   */
  async ack(message: MessageResolvable): Promise<void> {
    const id = this.resolveId(message);
    if (!id) {
      throw new TypeError("INVALID_TYPE");
    }
    await this.client.api.put(`/channels/${this.channel.id}/ack/${id}`);
  }

  /**
   * bulk delete messages from the channel
   * @param messages The messages to delete. Can be an array of message IDs or a Map of message IDs to Message objects.
   * @returns Promise that resolves when the messages are deleted
   */
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

  /**
   * delete a message from the channel
   * @param message The message to delete. Can be a Message object or a message ID.
   * @returns Promise that resolves when the message is deleted
   */
  async delete(message: MessageResolvable): Promise<void> {
    const id = this.resolveId(message);
    if (!id) {
      throw new TypeError("INVALID_TYPE");
    }
    await this.client.api.delete(`/channels/${this.channel.id}/messages/${id}`);
  }

  /**
   * edit a message in the channel
   * @param message The message to edit. Can be a Message object or a message ID.
   * @param options The options to edit the message with. Can be a string or an object with the following properties:
   * - content: The new content of the message
   * - attachments: An array of attachment URLs
   * - embeds: An array of MessageEmbed objects
   * @returns Promise that resolves when the message is edited
   */
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

  /**
   * search for messages in the channel
   * @param query The query to search for. Can be a string or an object with the following properties:
   * - query: The query to search for
   * - limit: The maximum number of messages to return
   * - before: The message ID to start searching from (exclusive)
   * - after: The message ID to stop searching at (exclusive)
   * - sort: The sort order of the results (asc or desc)
   * @returns Promise that resolves to a Map of message IDs to Message objects
   */
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

  /**
   * fetch a message from the channel
   * @param message The message to fetch. Can be a Message object, a message ID, or an object with the following properties:
   * - limit: The maximum number of messages to return
   * - before: The message ID to start fetching from (exclusive)
   * - after: The message ID to stop fetching at (exclusive)
   * @returns Promise that resolves to a Message object or a Map of message IDs to Message objects
   */
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

  /**
   * add a reaction to a message
   * @param message The message to react to. Can be a Message object or a message ID.
   * @param emoji emoji to react with. Can be a string or an Emoji object.
   * @returns Promise that resolves when the reaction is added
   */
  async addReaction(
    message: MessageResolvable | string,
    emoji: string | Emoji,
  ): Promise<void> {
    const id = this.resolveId(message);
    if (!id) {
      throw new TypeError("INVALID_TYPE");
    }
    if (emoji instanceof Emoji) emoji = emoji.id;
    else if (typeof emoji !== "string") {
      throw new TypeError("INVALID_TYPE");
    }
    await this.client.api.put(
      `/channels/${this.channel.id}/messages/${id}/reactions/${emoji}`,
    );
  }

  /**
   *
   * @param message The message to unreact. Can be a Message object or a message ID.
   * @param emoji the emoji to unreact with. Can be a string or an Emoji object.
   * @param user_id The user ID to remove the reaction for. If not provided, removes the reaction for the current user.
   * @param remove_all Whether to remove all of the specified reaction for the message. Defaults to false.
   * @returns Promise that resolves when the reaction is removed
   */
  async removeReaction(
    message: MessageResolvable | string,
    emoji: string | Emoji,
    user_id?: string,
    remove_all = false,
  ): Promise<void> {
    const id = this.resolveId(message);
    if (!id) {
      throw new TypeError("INVALID_TYPE");
    }
    if (emoji instanceof Emoji) emoji = emoji.id;
    else if (typeof emoji !== "string") {
      throw new TypeError("INVALID_TYPE");
    }
    const queryString = user_id
      ? `?user_id=${user_id}&remove_all=${remove_all}`
      : `?remove_all=${remove_all}`;
    await this.client.api.delete(
      `/channels/${this.channel.id}/messages/${id}/reactions/${emoji}${queryString}`,
    );
  }

  /**
   * remove all reactions from a message
   * @param message The message to remove reactions from. Can be a Message object or a message ID.
   * @returns Promise that resolves when the reactions are removed
   */
  async removeAllReactions(message: MessageResolvable | string): Promise<void> {
    const id = this.resolveId(message);
    if (!id) {
      throw new TypeError("INVALID_TYPE");
    }
    await this.client.api.delete(
      `/channels/${this.channel.id}/messages/${id}/reactions`,
    );
  }
}
