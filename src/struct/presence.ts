import { Base } from "./base";

/**
 * Enum representing the possible presence statuses of a user.
 */
export enum Status {
  Online = "Online",
  Idle = "Idle",
  Focus = "Focus",
  Busy = "Busy",
  Invisible = "Invisible",
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
