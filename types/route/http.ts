/*
HTTPRoute struct {
    *entry.ReverseProxyEntry

    HealthMon health.HealthMonitor `json:"health,omitempty"`
*/

import { ReverseProxy } from "../entry/reveser_proxy";

import { Health } from "./health";

export interface HTTPRoute extends ReverseProxy {
  health?: Health;
}
