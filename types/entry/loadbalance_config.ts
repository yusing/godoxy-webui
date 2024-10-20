/*
Config struct {
    Link    string                `json:"link" yaml:"link"`
    Mode    Mode                  `json:"mode" yaml:"mode"`
    Weight  weightType            `json:"weight" yaml:"weight"`
    Options middleware.OptionsRaw `json:"options,omitempty" yaml:"options,omitempty"`
}
*/

export interface LoadBalanceConfig {
  link: string;
  mode: "roundrobin" | "leastconn" | "iphash";
  weight: number;
  options?: Record<string, any>;
}
