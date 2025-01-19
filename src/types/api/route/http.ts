/*
HTTPRoute struct {
    *entry.ReverseProxyEntry

    HealthMon health.HealthMonitor `json:"health,omitempty"`
*/

import type { ReverseProxy } from "../entry/reveser_proxy";

import type { Health } from "./health";

export interface HTTPRoute extends ReverseProxy {
  health?: Health;
}
