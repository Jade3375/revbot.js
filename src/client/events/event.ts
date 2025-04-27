import type { client } from "../client";

export abstract class Event {
  constructor(protected readonly client: client) {}
  abstract handle(data: unknown): Awaited<unknown | void>;
}

export { Events } from "../../utils/constants";
export type * as API from "revolt-api";
