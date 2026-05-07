import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SettingsListItem from './SettingsListItem.vue'

describe('SettingsListItem', () => {
  it('renders default slot content inside an <li>', () => {
    const wrapper = mount(SettingsListItem, {
      slots: { default: '<span class="content">primary</span>' },
    })
    expect(wrapper.element.tagName).toBe('LI')
    expect(wrapper.find('.content').text()).toBe('primary')
  })

  it('renders the subtext slot when provided', () => {
    const wrapper = mount(SettingsListItem, {
      slots: {
        default: 'top',
        subtext: '<span class="sub">extra</span>',
      },
    })
    expect(wrapper.find('.sub').text()).toBe('extra')
  })

  it('omits the subtext block when no subtext slot is provided', () => {
    const wrapper = mount(SettingsListItem, {
      slots: { default: 'top' },
    })
    expect(wrapper.find('.text-gray-600').exists()).toBe(false)
  })

  it('renders as the requested element via the `as` prop', () => {
    const wrapper = mount(SettingsListItem, {
      props: { as: 'a' },
      attrs: { href: 'https://example.com' },
      slots: { default: 'link' },
    })
    const anchor = wrapper.find('a')
    expect(anchor.exists()).toBe(true)
    expect(anchor.attributes('href')).toBe('https://example.com')
  })

  it('passes through innerClass to the inner element', () => {
    const wrapper = mount(SettingsListItem, {
      props: { innerClass: '!flex items-center justify-between' },
      slots: { default: 'x' },
    })
    const inner = wrapper.find('div, a, button')
    expect(inner.classes()).toContain('!flex')
    expect(inner.classes()).toContain('items-center')
  })
})
