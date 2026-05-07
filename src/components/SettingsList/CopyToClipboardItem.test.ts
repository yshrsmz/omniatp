import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import CopyToClipboardItem from './CopyToClipboardItem.vue'

describe('CopyToClipboardItem', () => {
  it('renders the toggle in the off state', () => {
    const wrapper = mount(CopyToClipboardItem, { props: { enabled: false } })
    const toggle = wrapper.find('button[role="switch"]')
    expect(toggle.attributes('aria-checked')).toBe('false')
  })

  it('renders the toggle in the on state', () => {
    const wrapper = mount(CopyToClipboardItem, { props: { enabled: true } })
    const toggle = wrapper.find('button[role="switch"]')
    expect(toggle.attributes('aria-checked')).toBe('true')
  })

  it('emits update:enabled with the inverted value when the toggle is clicked', async () => {
    const wrapper = mount(CopyToClipboardItem, { props: { enabled: false } })
    await wrapper.find('button[role="switch"]').trigger('click')
    expect(wrapper.emitted('update:enabled')?.[0]).toEqual([true])
  })
})
