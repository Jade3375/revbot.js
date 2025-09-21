import type { client } from "../client/client";

export abstract class BaseManager<Holds extends { id: string }, R = unknown> {
  /** Shared default max size for all managers (can be changed globally). */
  static defaultMaxSize = -1;

  /** Insertion ordered cache of items this manager holds. */
  readonly cache = new Map<string, Holds>();

  /** Instance level max size (can be changed per manager instance). */
  protected maxSize: number;

  /** @private */
  Holds: any;

  constructor(
    protected readonly client: client,
    maxSize = BaseManager.defaultMaxSize,
  ) {
    this.maxSize = maxSize;
  }

  /**
   * Adds a raw object to the cache, constructing the holdable class.
   * Automatically evicts oldest entries if the max size is exceeded.
   * @private
   */
  _add(raw: R): Holds {
    if (!this.holds) throw new Error("Holds is not defined");
    const obj = new this.holds(this.client, raw);
    this.cache.set(obj.id, obj);
    this.enforceMaxSize();
    return obj;
  }

  /** Remove an entry by id.
   * @private
   */
  _remove(id: string): void {
    this.cache.delete(id);
  }

  /** Adjust the maximum size for this manager at runtime. */
  setMaxSize(size: number): void {
    if (!Number.isFinite(size) || size < -1)
      throw new RangeError("maxSize must be a non-negative finite number");
    this.maxSize = size;
    this.enforceMaxSize();
  }

  /** Force eviction until cache size is within the limit. */
  protected enforceMaxSize(): void {
    if (this.maxSize === -1) return;
    if (this.maxSize === 0) {
      // Special case: caching disabled.
      this.cache.clear();
      return;
    }
    while (this.cache.size > this.maxSize) {
      const oldestKey = this.cache.keys().next().value as string | undefined;
      if (oldestKey === undefined) break;
      this.cache.delete(oldestKey);
    }
  }

  abstract readonly holds: (new (...args: any[]) => Holds) | null;

  resolve(resolvable: Holds): Holds | null;
  resolve(resolvable: string | R): Holds | null;
  resolve(resolvable: string | R | Holds): Holds | null;
  resolve(resolvable: string | R | Holds): Holds | null {
    const id = this.resolveId(resolvable);
    if (id) return this.cache.get(id) ?? null;
    return null;
  }

  resolveId(resolvable: string | Holds | R): string | null {
    if (resolvable == null) return null;
    if (typeof resolvable === "string") return resolvable;
    if (this.holds && resolvable instanceof this.holds) return resolvable.id;
    const raw = resolvable as unknown as { _id: string };
    if (typeof raw === "object" && "_id" in raw) raw._id ?? null;
    return null;
  }

  valueOf(): this["cache"] {
    return this.cache;
  }
}
