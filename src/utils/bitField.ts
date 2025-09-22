const DEFAULT_BIT = 0;

/** A type that can be a BitField, number, string, or an array of these types.
 * @private
 */
export type BitFieldResolvable =
  | BitField
  | number
  | string
  | BitFieldResolvable[];

/**
 * Represents a bitfield that can be used to manage flags or permissions.
 */
export class BitField {
  static FLAGS: Record<string, number> = {};
  bitfield = DEFAULT_BIT;
  constructor(bits: BitFieldResolvable = DEFAULT_BIT) {
    this.bitfield = this.self.resolve(bits);
  }

  /**
   * Resolves a bitfield or an array of bitfields into a single number.
   * @param bit The bitfield or array of bitfields to resolve.
   * @returns The resolved bitfield as a number.
   */
  static resolve(bit: BitFieldResolvable): number {
    if (bit instanceof BitField) return bit.bitfield;
    if (typeof bit === "number" && bit >= DEFAULT_BIT) return bit;
    if (Array.isArray(bit)) {
      return bit
        .map((p) => this.resolve(p))
        .reduce((prev, p) => prev | p, DEFAULT_BIT);
    }
    if (typeof this.FLAGS[bit] !== "undefined") return this.FLAGS[bit];
    throw new Error("BITFIELD_INVALID");
  }
  /**
   * Returns the class that this instance belongs to.
   * @returns The class of the bitfield.
   */
  get self(): {
    FLAGS: Record<string, number>;
    resolve(bit: BitFieldResolvable): number;
    new (bits?: BitFieldResolvable): BitField;
  } {
    return this.constructor as unknown as {
      FLAGS: Record<string, number>;
      resolve(bit: BitFieldResolvable): number;
      new (bits?: BitFieldResolvable): BitField;
    };
  }

  /**
   * Checks if any of the bits in the bitfield are set.
   * @param bit The bitfield or array of bitfields to check.
   * @returns True if any bits are set, false otherwise.
   */
  any(bit: BitFieldResolvable): boolean {
    bit = this.self.resolve(bit);
    return (this.bitfield & bit) !== DEFAULT_BIT;
  }

  /**
   * checks if a specific permission is set.
   */
  has(bit: BitFieldResolvable): boolean {
    bit = this.self.resolve(bit);
    return (this.bitfield & bit) === bit;
  }

  /**
   * Returns an array of all the Permissions that are set in the bitfield.
   * @returns An array of flag names.
   */
  toArray(): string[] {
    return Object.keys(this.self.FLAGS).filter((bit) => this.has(bit));
  }

  add(...bits: BitFieldResolvable[]): this {
    let total = 0;

    for (const bit of bits) {
      total |= this.self.resolve(bit);
    }

    if (Object.isFrozen(this)) {
      return new this.self(this.bitfield | total) as this;
    }

    this.bitfield |= total;

    return this;
  }

  remove(...bits: BitFieldResolvable[]): this {
    let total = 0;

    for (const bit of bits) {
      total |= this.self.resolve(bit);
    }

    if (Object.isFrozen(this)) {
      return new this.self(this.bitfield & ~total) as this;
    }

    this.bitfield &= ~total;

    return this;
  }

  freeze(): Readonly<this> {
    return Object.freeze(this);
  }

  valueOf(): number {
    return this.bitfield;
  }

  /**
   *
   * @returns A record of all flags and their boolean values indicating whether they are set.
   */
  serialize(): Record<string, boolean> {
    const serialized: Record<string, boolean> = {};
    for (const [flag, bit] of Object.entries(this.self.FLAGS)) {
      serialized[flag] = this.has(bit);
    }
    return serialized;
  }

  *[Symbol.iterator](): Iterable<string> {
    yield* this.toArray();
  }
}
