import type { Embed as APIEmbed, Special, SendableEmbed } from "revolt-api";
import { client } from "../client/client";
import { Readable } from "stream";
import axios from "axios";
import FormData from "form-data";
import { File } from "node:buffer";
import { CDNAttachmentResponse } from "../utils/types";

export type Embed = APIEmbed;
export type EmbedImage = Extract<Embed, { type: "Image" }>;
export type EmbedVideo = Extract<Embed, { type: "Video" }>;
export type EmbedSpecial = Special;

/**
 * Represents a message embed, which can include rich content such as titles, descriptions, URLs, and media.
 */
export class MessageEmbed {
  #url?: string;
  #title?: string;
  #description?: string;
  #icon_url?: string;
  #color?: string;
  #media?: Readable | string | File;

  /**
   * Sets the title of the embed.
   *
   * @param {string} title - The title to set.
   * @returns {this} The updated `MessageEmbed` instance.
   */
  setTitle(title: string): this {
    this.#title = title;
    return this;
  }

  /**
   * Sets the icon URL of the embed.
   *
   * @param {string} iconURL - The URL of the icon to set.
   * @returns {this} The updated `MessageEmbed` instance.
   */
  setIcon(iconURL: string): this {
    this.#icon_url = iconURL;
    return this;
  }

  /**
   * Sets the color of the embed.
   *
   * @param {string} color - The color to set (e.g., a hex code).
   * @returns {this} The updated `MessageEmbed` instance.
   */
  setColor(color: string): this {
    this.#color = color;
    return this;
  }

  /**
   * Sets the description of the embed.
   *
   * @param {string} description - The description to set.
   * @returns {this} The updated `MessageEmbed` instance.
   */
  setDescription(description: string): this {
    this.#description = description;
    return this;
  }

  /**
   * Sets the URL of the embed.
   *
   * @param {string} url - The URL to set.
   * @returns {this} The updated `MessageEmbed` instance.
   */
  setURL(url: string): this {
    this.#url = url;
    return this;
  }

  /**
   * Sets the media (e.g., image or video) of the embed.
   *
   * @param {Readable | string | File} media - The media URL, File or Stream to set.
   * @returns {this} The updated `MessageEmbed` instance.
   */
  setMedia(media: Readable | string | File): this {
    this.#media = media;
    return this;
  }

  /**
   *
   * @param client The client instance used to send the embed.
   * @returns SendableEmbed
   * Converts the embed to a JSON object that can be sent to the API, including media handling.
   */
  async toJSONWithMedia(client: client): Promise<SendableEmbed> {
    const embed: SendableEmbed = {
      title: this.#title,
      icon_url: this.#icon_url,
      colour: this.#color,
      description: this.#description,
      url: this.#url,
    };

    if (this.#media) {
      let att = this.#media;
      const data = new FormData();
      if (typeof att === "string") {
        const readableStream = (await axios.get(att, {
          responseType: "stream",
        })) as { data: Readable };
        data.append("file", readableStream.data, {
          filename: att.split("/").pop(),
        });
      }

      if (att instanceof Readable) {
        data.append("file", att);
      }

      if (att instanceof File) {
        const buffer = Buffer.from(await att.arrayBuffer());
        data.append("file", buffer, { filename: att.name });
      }

      await client.cdn.post("/attachments", data).then((attachment) => {
        const { id } = attachment as CDNAttachmentResponse;
        embed.media = id;
      });
    }

    return embed;
  }

  /**
   * Converts the embed to a JSON object that can be sent to the API.
   *
   * @returns {SendableEmbed} The JSON representation of the embed.
   */
  toJSON(): SendableEmbed {
    return {
      title: this.#title,
      icon_url: this.#icon_url,
      colour: this.#color,
      description: this.#description,
      url: this.#url,
      media: this.#media?.toString(),
    };
  }
}
