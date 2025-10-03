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

/**
 * @private
 */
export interface ApiDiscoveryResponse {
  revolt: string;
  features: Features;
  ws: string; // WebSocket URL
  app: string; // App URL
  vapid: string; // VAPID public key
  build: BuildInfo;
}
/**
 * @private
 */
export interface Features {
  captcha: CaptchaFeature;
  email: boolean;
  invite_only: boolean;
  autumn: ServiceWithUrl; // CDN
  january: ServiceWithUrl; // Proxy
  livekit: LivekitFeature;
}
/**
 * @private
 */
export interface CaptchaFeature {
  enabled: boolean;
  key: string;
}
/**
 * @private
 */
export interface ServiceWithUrl {
  enabled: boolean;
  url: string;
}
/**
 * @private
 */
export interface LivekitFeature {
  enabled: boolean;
  nodes: LivekitNode[];
}
/**
 * @private
 */
export interface LivekitNode {
  name: string;
  lat: number;
  lon: number;
  public_url: string;
}
/**
 * @private
 */
export interface BuildInfo {
  commit_sha: string;
  commit_timestamp: string;
  semver: string;
  origin_url: string;
  timestamp: string;
}
