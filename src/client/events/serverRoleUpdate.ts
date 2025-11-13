import { Event, API, Events } from "./event";
import type { Role as APIRole } from "revolt-api";

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
  async handle(data: {
    id: string;
    role_id: string;
    data: API.Role & { _id: string };
    clear: API.FieldsRole[];
  }): Promise<void> {
    const server = this.client.servers.cache.get(data.id);

    if (!server) return;

    let role = server.roles.cache.get(data.role_id);
    const oldRole = role?._update(data.data, data.clear);

    if (!oldRole && !role) {
      await Promise.all(
        Object.values(data.data).map(async (raw) => {
          if (raw && typeof raw === "object") {
            server.roles._add({
              name: "",
              permissions: {
                a: 0,
                d: 0,
              },
              ...raw,
              id: data.role_id,
            });
          }
        }),
      );
      role = server.roles.cache.get(data.role_id)!;
    }

    if (role && oldRole && !role.equals(oldRole)) {
      this.client.emit(Events.ROLE_UPDATE, oldRole, role);
    }
  }
}
