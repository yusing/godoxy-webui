type MemoryInfo = {
  total: number;
  used: number;
  used_percent: number;
  available: number;
};

type DiskInfo = {
  path: string;
  fstype: string;
  total: number;
  used: number;
  used_percent: number;
  free: number;
};

type NetworkIOInfo = {
  name: string;
  bytes_sent: number;
  bytes_recv: number;
  upload_speed: number;
  download_speed: number;
};

type SensorInfo = {
  sensorKey: string;
  temperature: number;
  sensorHigh: number;
  sensorCritical: number;
};

type SystemInfo = {
  timestamp: number;
  time: string;
  cpu_average: number;
  memory: MemoryInfo;
  disk: DiskInfo;
  network: NetworkIOInfo;
  sensors: SensorInfo[];
};

export type { DiskInfo, MemoryInfo, NetworkIOInfo, SensorInfo, SystemInfo };
