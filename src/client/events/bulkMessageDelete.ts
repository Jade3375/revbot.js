import { Event, Events } from "./event";

/**
 * Represents the event handler for bulk message deletions.
 * @private
 * @extends Event
 */
export class BulkMessageDelete extends Event {
  /**
   * Handles the bulk message delete event.
   *
   * @param {{ ids: string[] }} data - The data for the event, containing the IDs of the deleted messages.
   */
  handle(data: { ids: string[] }) {
    // TODO: Get cached messages
    this.client.emit(Events.MESSAGE_DELETE_BULK, data.ids);
  }
}
