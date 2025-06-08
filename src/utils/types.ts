import { Role } from "revolt-api";
import { FullPermissions } from "./permissions";

/**
 * Represents a response from the API when uploading an attachment.
 */
export type CDNAttachmentResponse = {
  id: string;
};

/**
 * Represents the permissions that can be set for a role.
 */
export type editablePermissions = {
  /**
   * Permissions to allow for the role.
   * Each key corresponds to a permission flag in FullPermissions.
   */
  a?: Array<keyof (typeof FullPermissions)["FLAGS"]>;
  /**
   * Permissions to deny for the role.
   * Each key corresponds to a permission flag in FullPermissions.
   */
  d?: Array<keyof (typeof FullPermissions)["FLAGS"]>;
};

/**
 * Represents a role that can be edited in a server.
 */
export type editableRole = {
  /**
   * Name of the role.
   */
  name?: string;
  /**
   * Colour of the role, or `null` if no colour is set.
   */
  colour?: string | null;
  /**
   * Whether the role is displayed separately in the member list.
   */
  hoist?: boolean;
  /**
   * Rank of the role, used for ordering.
   */
  rank?: number;
  /**
   * Permissions to set for the role.
   * Format: { a: allow, d: deny }
   */
  permissions?: editablePermissions;
  /**
   * Fields to remove from the role.
   * Each key corresponds to a field in the Role type.
   */
  remove?: Array<keyof Role & { [key: string]: unknown }>;
};
