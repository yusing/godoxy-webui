type MemoryInfo = {
  total: number;
  used: number;
  used_percent: number;
  available: number;
};

type DiskUsage = {
  path: string;
  fstype: string;
  total: number;
  free: number;
  used: number;
  used_percent: number;
};

type DiskIO = {
  read_bytes: number;
  write_bytes: number;
  read_speed: number;
  write_speed: number;
  iops: number;
};

type NetworkIOInfo = {
  bytes_sent: number;
  bytes_recv: number;
  upload_speed: number;
  download_speed: number;
};

type SensorInfo = {
  name: string;
  temperature: number;
  sensorHigh: number;
  sensorCritical: number;
};

type SystemInfo = {
  timestamp: number;
  cpu_average?: number;
  memory?: MemoryInfo;
  disks?: Record<string, DiskUsage>;
  disk_io?: Record<string, DiskIO>;
  network?: NetworkIOInfo;
  sensors?: Record<string, SensorInfo>;
};

export const AggregateTypes = [
  "cpu_average",
  "memory_usage",
  "memory_usage_percent",
  "disks_read_speed",
  "disks_write_speed",
  "disks_iops",
  "disk_usage",
  "network_speed",
  "network_transfer",
  "sensor_temperature",
] as const;

export type AggregateType = (typeof AggregateTypes)[number];

export type {
  DiskIO,
  DiskUsage,
  MemoryInfo,
  NetworkIOInfo,
  SensorInfo,
  SystemInfo,
};
