import { Event, Events } from "./event";

/**
 * Represents the event handler for channel deletion.
 * @private
 * @extends Event
 */
export class ChannelDelete extends Event {
  /**
   * Handles the channel deletion event.
   *
   * @param {{ id: string }} data - The data for the event, containing the ID of the deleted channel.
   * @returns {{ channel: unknown }} An object containing the deleted channel, or `undefined` if not found.
   */
  handle(data: { id: string }): unknown {
    const channel = this.client.channels.cache.get(data.id);

    if (channel) {
      if (channel.inServer()) {
        channel.server?.channels.cache.delete(channel.id);
      }
      this.client.emit(Events.CHANNEL_DELETE, channel);
    }

    return { channel };
  }
}
