type ProxmoxStatsSummary = {
  status: 'stopped' | 'running' | 'suspended'
  cpuPercent: string
  memoryUsageAndLimit: string
  memoryPercent: string
  networkRxTx: string
  blockReadWrite: string
}

// format: "STATUS|CPU%%|MEM USAGE/LIMIT|MEM%%|NET I/O|BLOCK I/O"
// example: running|31.1%|9.6GiB/20GiB|48.87%|4.7GiB/3.3GiB|25GiB/36GiB
export function parseProxmoxStatsLine(line: string): ProxmoxStatsSummary {
  const [status, cpuPercent, memoryUsageAndLimit, memoryPercent, networkRxTx, blockReadWrite] =
    line.split('|')
  return {
    status: status as 'stopped' | 'running' | 'suspended',
    cpuPercent: cpuPercent ?? '—',
    memoryUsageAndLimit: memoryUsageAndLimit ?? '—',
    memoryPercent: memoryPercent ?? '—',
    networkRxTx: networkRxTx ?? '—',
    blockReadWrite: blockReadWrite ?? '—',
  }
}
