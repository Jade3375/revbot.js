import { Event, Events } from "./event";

/**
 * Represents the event handler for when a user stops typing in a channel.
 *
 * @extends Event
 */
export class ChannelStopTyping extends Event {
  /**
   * Handles the typing stop event.
   *
   * @param {{ id: string; user: string }} data - The data for the event, containing the channel ID and user ID.
   * @returns {{ channel: unknown; user: unknown }} An object containing the channel and user involved in the event.
   */
  handle(data: { id: string; user: string }): unknown {
    const channel = this.client.channels.cache.get(data.id);
    const user = this.client.users.cache.get(data.user);

    if (channel?.isText() && user) {
      this.client.emit(Events.TYPING_STOP, channel, user);
    }

    return { channel, user };
  }
}
