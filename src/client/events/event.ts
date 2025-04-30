import type { client } from "../client";

/**
 * Represents the base class for all event handlers.
 * All event handlers must extend this class and implement the `handle` method.
 */
export abstract class Event {
  /**
   * Creates a new Event instance.
   *
   * @param {client} client - The client instance.
   */
  constructor(protected readonly client: client) {}

  /**
   * Handles the event logic.
   * This method must be implemented by subclasses to define the behavior for the specific event.
   *
   * @param {unknown} data - The data associated with the event.
   * @returns {Promise<unknown | void>} A promise that resolves with the result of the event handling or `void`.
   */
  abstract handle(data: unknown): Awaited<unknown | void>;
}

export { Events } from "../../utils/constants";
export type * as API from "revolt-api";
