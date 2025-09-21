import type { Role as APIRole } from "revolt-api";
import { BaseManager } from "./baseManager";
import { Role, Server } from "../struct/index";
import { FullPermissions } from "../utils";
import { editableRole } from "../utils/types";

export type RoleResolvable = Role | string;

export class RoleManager extends BaseManager<Role, APIRole & { id: string }> {
  /** @private */
  holds = Role;
  constructor(protected readonly server: Server) {
    super(server.client);
  }

  /** @private */
  _add(data: APIRole & { id: string }): Role {
    const role = new Role(this.server, data);
    this.cache.set(role.id, role);
    return role;
  }

  /**
   * creates a new role in the server
   * @param name The name of the role to create
   * @returns
   */
  async create(name: string): Promise<Role> {
    const { id, role } = await this.client.api.post<{
      id: string;
      role: APIRole;
    }>(`/servers/${this.server.id}/roles`, { body: { name } });
    return this._add(Object.assign(role, { id }));
  }

  /**
   * deletes a role from the server
   * @param role the role to delete
   * @returns A promise that resolves when the role is deleted
   */
  async delete(role: RoleResolvable): Promise<void> {
    const id = this.resolveId(role);
    if (!id) throw new TypeError("INVALID_TYPE");
    await this.client.api.delete(`/servers/${this.server.id}/roles/${id}`);
  }

  /**
   *
   * @param role the role to edit
   * @param data data to edit the role with
   * @param data.permissions The permissions to set for the role, in the format { a: allow, d: deny }
   * @param data.name The name of the role
   * @param data.colour The color of the role, or `null` if no color is set
   * @param data.hoist Whether the role is displayed separately in the member list
   * @param data.rank The rank of the role, used for ordering
   * @param data.remove Fields to remove from the role
   * @returns Role
   * @throws {TypeError} If the role ID is invalid
   */
  async edit(role: RoleResolvable, data: editableRole): Promise<Role> {
    const id = this.resolveId(role);
    if (!id) throw new TypeError("INVALID_TYPE");

    if (data.permissions) {
      const permissions = {
        allow: new FullPermissions(data.permissions?.a || []).bitfield,
        deny: new FullPermissions(data.permissions?.d || []).bitfield,
      };

      await this.client.api.put(
        `/servers/${this.server.id}/permissions/${id}`,
        { body: { permissions } },
      );
    }
    delete data.permissions;
    const updatedRole = (await this.client.api.patch(
      `/servers/${this.server.id}/roles/${id}`,
      { body: data },
    )) as APIRole;

    return this._add(Object.assign(updatedRole, { id }));
  }
}
