import { Event, API, Events } from "./event";

/**
 * Represents the event handler for server role updates.
 * @private
 * @extends Event
 */
export class ServerRoleUpdate extends Event {
  /**
   * Handles the server role update event.
   *
   * @param {{ id: string; role_id: string; data: API.Role & { _id: string }; clear: API.FieldsRole[] }} data - The data for the event, containing the server ID, role ID, updated role data, and fields to clear.
   * @returns {void}
   */
  handle(data: {
    id: string;
    role_id: string;
    data: API.Role & { _id: string };
    clear: API.FieldsRole[];
  }): void {
    const server = this.client.servers.cache.get(data.id);

    if (!server) return;

    const role = server.roles.cache.get(data.role_id);
    const oldRole = role?._update(data.data, data.clear);

    if (role && oldRole && !role.equals(oldRole)) {
      this.client.emit(Events.ROLE_UPDATE, oldRole, role);
    }
  }
}
