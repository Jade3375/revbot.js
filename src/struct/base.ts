import { client } from "../client/client";
import { BitField } from "../utils/bitField";

type PartialObject = Partial<
  { _id: string } | { id: string } | { _id: { user: string } }
>;

export abstract class Base {
  id!: string;

  constructor(public readonly client: client) {}

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

  _update(data: PartialObject, clear?: string[]): this {
    const clone = this._clone();
    this._patch(data, clear);
    return clone;
  }

  protected _patch(data: PartialObject, _clear?: string[]): this {
    if ("id" in data) this.id = data.id!;
    if ("_id" in data) {
      if (typeof data._id === "string") this.id = data._id;
      if (typeof data._id === "object") this.id = data._id.user;
    }
    return this;
  }

  _clone(): this {
    const clone = Object.assign(Object.create(this), this);

    for (const key in clone) {
      const prop = clone[key];
      if (prop instanceof Base) clone[key] = prop._clone();
    }

    return clone;
  }
}
