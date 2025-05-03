import { CIDR, IPv4, IPv6 } from "../types";
import { ACLLogConfig } from "./access_log";

export type ACLMatcher =
  | IPMatcher
  | CIDRMatcher
  | CountryISOMatcher
  | TimezoneMatcher;
export type IPMatcher = `ip:${IPv4 | IPv6}`;
export type CIDRMatcher = `cidr:${CIDR}`;
export type CountryISOMatcher = `country:${string}`;
export type TimezoneMatcher = `tz:${string}/${string}`;

export type ACLConfig = {
  /**
   * Default action
   * @default "allow"
   */
  default?: "allow" | "deny";
  /**
   * Allow local addresses
   * @default true
   */
  allow_local?: boolean;
  /**
   * Allow list
   */
  allow?: ACLMatcher[];
  /**
   * Deny list
   */
  deny?: ACLMatcher[];
  /**
   * ACL logger
   */
  log?: ACLLogConfig;
};
