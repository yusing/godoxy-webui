export type MemoryInfo = {
  total: number;
  used: number;
  used_percent: number;
  available: number;
};

export type DiskInfo = {
  path: string;
  fstype: string;
  total: number;
  used: number;
  used_percent: number;
  free: number;
};

export type NetworkIOInfo = {
  name: string;
  bytes_sent: number;
  bytes_recv: number;
  upload_speed: number;
  download_speed: number;
};

export type SensorInfo = {
  sensorKey: string;
  temperature: number;
  sensorHigh: number;
  sensorCritical: number;
};

export type SystemInfo = {
  timestamp: number;
  time: string;
  cpu_average: number;
  memory: MemoryInfo;
  disk: DiskInfo;
  network: NetworkIOInfo;
  sensors: SensorInfo[];
};
