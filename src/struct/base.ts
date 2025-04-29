import { client } from "../client/client";
import { BitField } from "../utils/bitField";

type PartialObject = Partial<
  { _id: string } | { id: string } | { _id: { user: string } }
>;

/**
 * Represents the base structure for all objects in the client.
 * Provides common functionality such as equality checks, cloning, and patching data.
 */
export abstract class Base {
  /** The unique identifier for the object. */
  id!: string;

  /**
   * Creates a new Base instance.
   *
   * @param {client} client - The client instance.
   */
  constructor(public readonly client: client) {}

  /**
   * Compares this object with another to determine if they are equal.
   *
   * @param {this | null} [obj] - The object to compare with.
   * @returns {boolean} `true` if the objects are equal, otherwise `false`.
   */
  equals(obj?: this | null): boolean {
    if (!obj) return false;

    for (const key in obj) {
      const a = obj[key],
        b = this[key];
      if (a instanceof Base && !a.equals(b as typeof a)) return false;
      if (
        a instanceof BitField &&
        a.bitfield !== (b as unknown as BitField).bitfield
      )
        return false;

      if (typeof a === "object" && a !== null) continue;
      if (a !== b) return false;
    }

    return true;
  }

  /**
   * Updates the object with new data and returns a clone of the object.
   *
   * @param {PartialObject} data - The data to update the object with.
   * @param {string[]} [clear] - Fields to clear in the object.
   * @returns {this} A clone of the updated object.
   */
  _update(data: PartialObject, clear?: string[]): this {
    const clone = this._clone();
    this._patch(data, clear);
    return clone;
  }

  /**
   * Patches the object with new data.
   *
   * @param {PartialObject} data - The data to patch the object with.
   * @param {string[]} [_clear] - Fields to clear in the object.
   * @returns {this} The updated object.
   * @protected
   */
  protected _patch(data: PartialObject, _clear?: string[]): this {
    if ("id" in data) this.id = data.id!;
    if ("_id" in data) {
      if (typeof data._id === "string") this.id = data._id;
      if (typeof data._id === "object") this.id = data._id.user;
    }
    return this;
  }

  /**
   * Creates a deep clone of the object.
   *
   * @returns {this} A clone of the object.
   */
  _clone(): this {
    const clone = Object.assign(Object.create(this), this);

    for (const key in clone) {
      const prop = clone[key];
      if (prop instanceof Base) clone[key] = prop._clone();
    }

    return clone;
  }
}
