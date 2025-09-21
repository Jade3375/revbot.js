import { Event, Events } from "./event";

/**
 * Represents the event handler for message deletions.
 * @private
 * @extends Event
 */
export class MessageDelete extends Event {
  /**
   * Handles the message deletion event.
   *
   * @param {{ id: string; channel: string }} data - The data for the event, containing the message ID and channel ID.
   * @returns {{ message: unknown } | {}} An object containing the deleted message, or an empty object if the channel is not text-based or the message is not found.
   */
  handle(data: { id: string; channel: string }): unknown {
    const channel = this.client.channels.cache.get(data.channel);

    if (channel?.isText()) {
      const message = channel.messages.cache.get(data.id);

      if (message) {
        channel.messages._remove(message.id);
        this.client.emit(Events.MESSAGE_DELETE, message);
      }

      return { message };
    }

    return {};
  }
}
