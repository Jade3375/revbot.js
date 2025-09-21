import { Event, API, Events } from "./event";

/**
 * Represents the event handler for channel updates.
 * @private
 * @extends Event
 */
export class ChannelUpdate extends Event {
  /**
   * Handles the channel update event.
   *
   * @param {{ id: string; data: API.Channel; clear: API.FieldsChannel }} data - The data for the event, containing the channel ID, updated data, and fields to clear.
   * @returns {void}
   */
  handle(data: {
    id: string;
    data: API.Channel;
    clear: API.FieldsChannel;
  }): void {
    const channel = this.client.channels.cache.get(data.id);
    const oldChannel = channel?._update(data.data);

    if (channel && oldChannel && !channel.equals(oldChannel)) {
      this.client.emit(Events.CHANNEL_UPDATE, oldChannel, channel);
    }
  }
}
