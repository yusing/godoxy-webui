import { expect, test } from 'bun:test'
import type { HomepageItem } from '@/lib/api'
import { getItemState } from './AppCategory'

const item: HomepageItem = {
  alias: 'erpnext',
  name: '',
  category: 'Others',
  show: true,
  favorite: true,
  icon: '',
  description: '',
  url: 'http://erpnext.example.com',
  origin_url: '',
  provider: 'docker',
  clicks: 0,
  sort_order: 0,
  fav_sort_order: 0,
  all_sort_order: 0,
  widgets: [],
}

test.each(['All', 'Favorites', 'Others', 'Hidden'])(
  'searches the displayed alias in %s when the name is empty',
  category => {
    const app = { ...item, show: category !== 'Hidden' }
    const expected = [false, [{ alias: 'erpnext', index: 0, visibleIndex: 0 }]]

    expect(getItemState([app], '', category)).toEqual(expected)
    expect(getItemState([app], 'erp', category)).toEqual(expected)
    expect(getItemState([app], 'ERP', category)).toEqual(expected)
  }
)

test('searches configured display names and keeps original item indices', () => {
  const apps = [
    { ...item, alias: 'immich' },
    { ...item, name: 'Business Suite' },
  ]

  expect(getItemState(apps, 'suite', 'All')).toEqual([
    false,
    [{ alias: 'erpnext', index: 1, visibleIndex: 0 }],
  ])
  expect(getItemState(apps, 'missing', 'All')).toEqual([true, []])
})

test('search does not expose hidden apps or non-favorites', () => {
  expect(getItemState([{ ...item, show: false }], 'erp', 'All')).toEqual([true, []])
  expect(getItemState([{ ...item, favorite: false }], 'erp', 'Favorites')).toEqual([true, []])
})
