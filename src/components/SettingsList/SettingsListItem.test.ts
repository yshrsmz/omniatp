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

  it('applies interactive affordance classes when rendered as a button', () => {
    const wrapper = mount(SettingsListItem, {
      props: { as: 'button' },
      slots: { default: 'x' },
    })
    const button = wrapper.find('button')
    expect(button.classes()).toContain('cursor-pointer')
    expect(button.classes()).toContain('hover:bg-gray-50')
  })

  it('applies interactive affordance classes when rendered as an anchor', () => {
    const wrapper = mount(SettingsListItem, {
      props: { as: 'a' },
      attrs: { href: 'https://example.com' },
      slots: { default: 'x' },
    })
    const anchor = wrapper.find('a')
    expect(anchor.classes()).toContain('cursor-pointer')
    expect(anchor.classes()).toContain('hover:bg-gray-50')
  })

  it('does not apply interactive affordance classes for the default div', () => {
    const wrapper = mount(SettingsListItem, {
      slots: { default: 'x' },
    })
    const inner = wrapper.find('li > div')
    expect(inner.classes()).not.toContain('cursor-pointer')
    expect(inner.classes()).not.toContain('hover:bg-gray-50')
  })

  it('forwards parent-provided class to the inner element, not the <li>', () => {
    const wrapper = mount(SettingsListItem, {
      props: { as: 'button' },
      attrs: { class: 'bg-blue-500' },
      slots: { default: 'x' },
    })
    const button = wrapper.find('button')
    expect(button.classes()).toContain('bg-blue-500')
    expect(wrapper.find('li').classes()).not.toContain('bg-blue-500')
  })

  it('keeps the SettingsListItem identifier class on the <li>', () => {
    const wrapper = mount(SettingsListItem, {
      slots: { default: 'x' },
    })
    expect(wrapper.find('li').classes()).toContain('SettingsListItem')
  })
})
