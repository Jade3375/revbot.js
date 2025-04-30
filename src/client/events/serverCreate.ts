import { Event, API, Events } from "./event";

/**
 * Represents the event handler for server creation.
 *
 * @extends Event
 */
export class ServerCreate extends Event {
  /**
   * Handles the server creation event.
   *
   * @param {API.Server} data - The raw data for the created server from the API.
   * @returns {Promise<void>} A promise that resolves when the server is added and members are optionally fetched.
   */
  async handle(data: API.Server): Promise<void> {
    const server = this.client.servers._add(data);

    if (this.client.options.fetchMembers) {
      await server.members.fetch();
    }

    this.client.emit(Events.SERVER_CREATE, server);
  }
}
