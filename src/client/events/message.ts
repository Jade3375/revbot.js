import { Event, API, Events } from "./event";
import { SYSTEM_USER_ID } from "../../utils/constants";

/**
 * Represents the event handler for incoming messages.
 *
 * @extends Event
 */
export class Message extends Event {
  /**
   * Handles the message event.
   *
   * @param {API.Message} data - The raw data for the message from the API.
   * @returns {Promise<{ message: unknown }>} A promise that resolves with the created message, or an empty object if the channel is not text-based.
   */
  async handle(data: API.Message): Promise<unknown> {
    const channel = this.client.channels.cache.get(data.channel);

    if (channel?.isText()) {
      if (data.user?.bot && this.client.options.ignoreBots) {
        return {};
      }
      const message = channel.messages._add(data);
      if (data.author !== SYSTEM_USER_ID && !data.webhook) {
        await this.client.users.fetch(data.author, { force: false });
      }

      this.client.emit(Events.MESSAGE, message);

      return { message };
    }

    return {};
  }
}
