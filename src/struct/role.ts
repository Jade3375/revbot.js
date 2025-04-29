import type { Role as APIRole, FieldsRole } from "revolt-api";
import { Base, Overwrite, Server } from "./index";
import { ChannelPermissions, UUID } from "../utils/index";

/**
 * Represents a role in a server.
 *
 * @extends Base
 */
export class Role extends Base {
  /** The name of the role. */
  name!: string;

  /** The color of the role, or `null` if no color is set. */
  color: string | null = null;

  /** Whether the role is displayed separately in the member list. */
  hoist = false;

  /** The rank of the role, used for ordering. */
  rank!: number;

  /** The permissions overwrite for the role. */
  overwrite!: Overwrite;

  /**
   * Creates a new Role instance.
   *
   * @param {Server} server - The server this role belongs to.
   * @param {APIRole & { id: string }} data - The raw data for the role from the API.
   */
  constructor(
    public server: Server,
    data: APIRole & { id: string },
  ) {
    super(server.client);
    this._patch(data);
  }

  /**
   * Updates the role instance with new data from the API.
   *
   * @param {APIRole & { _id?: string }} data - The raw data for the role from the API.
   * @param {FieldsRole[]} [clear=[]] - Fields to clear in the role.
   * @returns {this} The updated role instance.
   * @protected
   */
  protected _patch(
    data: APIRole & { _id?: string },
    clear: FieldsRole[] = [],
  ): this {
    super._patch(data);

    if (data.name) this.name = data.name;

    if (typeof data.hoist === "boolean") this.hoist = data.hoist;

    if (typeof data.rank === "number") this.rank = data.rank;

    if ("colour" in data) this.color = data.colour ?? null;

    if (data.permissions) {
      const { a, d } = data.permissions;
      this.overwrite = {
        allow: new ChannelPermissions(a),
        deny: new ChannelPermissions(d),
      };
    }

    for (const field of clear) {
      if (field === "Colour") this.color = null;
    }

    return this;
  }

  /**
   * Gets the date when the role was created.
   *
   * @returns {Date} The creation date of the role.
   */
  get createdAt(): Date {
    return UUID.timestampOf(this.id);
  }

  /**
   * Gets the timestamp of when the role was created.
   *
   * @returns {number} The creation timestamp of the role in milliseconds.
   */
  get createdTimestamp(): number {
    return this.createdAt.getTime();
  }

  /**
   * Gets the permissions overwrite for the role.
   *
   * @returns {Overwrite} The permissions overwrite for the role.
   */
  get permissions(): Overwrite {
    return this.overwrite;
  }

  /**
   * Deletes the role from the server.
   *
   * @returns {Promise<void>} A promise that resolves when the role is deleted.
   *
   * @example
   * ```typescript
   * await role.delete();
   * console.log("Role deleted successfully.");
   * ```
   */
  delete(): Promise<void> {
    return this.server.roles.delete(this);
  }

  /**
   * Converts the role to a string representation.
   *
   * @returns {string} A string representation of the role in the format `<@&roleId>`.
   */
  toString(): string {
    return `<@&${this.id}>`;
  }
}
