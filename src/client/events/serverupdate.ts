import { Event, API, Events } from "./event";

/**
 * Represents the event handler for server updates.
 *
 * @extends Event
 */
export class ServerUpdate extends Event {
  /**
   * Handles the server update event.
   *
   * @param {{ id: string; data: API.Server; clear: API.FieldsServer[] }} data - The data for the event, containing the server ID, updated server data, and fields to clear.
   * @returns {void}
   */
  handle(data: {
    id: string;
    data: API.Server;
    clear: API.FieldsServer[];
  }): void {
    const server = this.client.servers.cache.get(data.id);
    const oldServer = server?._update(data.data, data.clear);

    if (oldServer && server && !oldServer.equals(server)) {
      this.client.emit(Events.SERVER_UPDATE, oldServer, server);
    }
  }
}
