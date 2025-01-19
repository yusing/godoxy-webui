/*
Config struct {
    IdleTimeout time.Duration `json:"idle_timeout,omitempty"`
    WakeTimeout time.Duration `json:"wake_timeout,omitempty"`
    StopTimeout int           `json:"stop_timeout,omitempty"`
    StopMethod  StopMethod    `json:"stop_method,omitempty"`
    StopSignal  Signal        `json:"stop_signal,omitempty"`

    DockerHost       string `json:"docker_host,omitempty"`
    ContainerName    string `json:"container_name,omitempty"`
    ContainerID      string `json:"container_id,omitempty"`
    ContainerRunning bool   `json:"container_running,omitempty"`
}
*/

export enum StopMethod {
  Kill = "kill",
  Stop = "stop",
  Pause = "pause",
}

export enum Signal {
  SIGKILL = "SIGKILL",
  SIGTERM = "SIGTERM",
  SIGINT = "SIGINT",
}

export interface IdleWatcherConfig {
  idle_timeout?: number;
  wake_timeout?: number;
  stop_timeout?: number;
  stop_method?: StopMethod;
  stop_signal?: Signal;
  docker_host?: string;
  container_name?: string;
  container_id?: string;
  container_running?: boolean;
}
