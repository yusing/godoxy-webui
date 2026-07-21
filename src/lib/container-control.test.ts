import { describe, expect, test } from 'bun:test'
import { getContainerControlTarget, isProxmoxActionEnabled } from './container-control'

describe('getContainerControlTarget', () => {
  test('prefers Docker when both controls are present', () => {
    expect(
      getContainerControlTarget('container-id', {
        node: 'pve',
        vmid: 119,
      })
    ).toEqual({ type: 'docker', containerID: 'container-id' })
  })

  test('accepts only Proxmox LXC targets', () => {
    expect(getContainerControlTarget(null, { node: 'pve', vmid: 119 })).toEqual({
      type: 'proxmox',
      node: 'pve',
      vmid: 119,
    })
    expect(getContainerControlTarget(null, { node: 'pve', vmid: 0 })).toBeNull()
    expect(getContainerControlTarget()).toBeNull()
  })
})

describe('isProxmoxActionEnabled', () => {
  test.each([
    ['start', 'stopped', true],
    ['start', 'running', false],
    ['start', '', false],
    ['stop', 'running', true],
    ['stop', 'stopped', false],
    ['stop', '', false],
    ['restart', 'running', true],
    ['restart', 'stopped', false],
    ['restart', '', false],
  ] as const)('%s with %s status', (action, status, expected) => {
    expect(isProxmoxActionEnabled(action, status)).toBe(expected)
  })
})
