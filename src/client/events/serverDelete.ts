import { Event, API, Events } from "./event";

/**
 * Represents the event handler for server deletion.
 * @private
 * @extends Event
 */
export class ServerDelete extends Event {
  /**
   * Handles the server deletion event.
   *
   * @param {API.Server} data - The raw data for the deleted server from the API.
   * @returns {{ server: unknown }} An object containing the deleted server, or `undefined` if not found.
   */
  handle(data: API.Server): unknown {
    const server = this.client.servers.cache.get(data._id);

    if (server) {
      this.client.servers._remove(server.id);
      this.client.emit(Events.SERVER_DELETE, server);
    }

    return { server };
  }
}
