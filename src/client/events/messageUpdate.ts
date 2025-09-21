import { Event, API, Events } from "./event";

/**
 * Represents the event handler for message updates.
 * @private
 * @extends Event
 */
export class MessageUpdate extends Event {
  /**
   * Handles the message update event.
   *
   * @param {{ id: string; channel: string; data: API.Message }} data - The data for the event, containing the message ID, channel ID, and updated message data.
   * @returns {void}
   */
  handle(data: { id: string; channel: string; data: API.Message }): void {
    const channel = this.client.channels.cache.get(data.channel);

    if (!channel?.isText()) return;

    const message = channel?.messages.cache.get(data.id);
    const oldMessage = message?._update(data.data);

    if (oldMessage && message && !message.equals(oldMessage)) {
      this.client.emit(Events.MESSAGE_UPDATE, oldMessage, message);
    }
  }
}
