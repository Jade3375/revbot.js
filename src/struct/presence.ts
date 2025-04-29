import { Base } from "./base";

/**
 * Enum representing the possible presence statuses of a user.
 */
export enum Status {
  Online = "ONLINE",
  Idle = "IDLE",
  Busy = "DND",
  Invisible = "OFFLINE",
}

/**
 * Represents the presence of a user, including their status and custom text.
 *
 * @extends Base
 */
export class Presence extends Base {
  /** The custom status text of the user, or `null` if none is set. */
  text: string | null = null;

  /** The current status of the user (e.g., Online, Idle, Busy, Invisible). */
  status = Status.Invisible;
}
