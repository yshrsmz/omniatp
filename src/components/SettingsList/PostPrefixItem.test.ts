import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PostPrefixItem from './PostPrefixItem.vue'

describe('PostPrefixItem', () => {
  it('renders the current prefix in the subtext slot', () => {
    const wrapper = mount(PostPrefixItem, {
      props: { prefix: 'Watching ' },
      global: {
        // stub TextInputDialog so we don't need to deal with its teleport / Headless UI internals
        stubs: { TextInputDialog: true },
      },
    })
    expect(wrapper.text()).toContain('Watching')
  })

  it('clicks open the edit dialog without navigating', async () => {
    const wrapper = mount(PostPrefixItem, {
      props: { prefix: 'p' },
      global: { stubs: { TextInputDialog: true } },
    })

    const link = wrapper.find('a')
    await link.trigger('click')

    // The TextInputDialog stub receives `show` via v-model
    const dialog = wrapper.findComponent({ name: 'TextInputDialog' })
    expect(dialog.exists()).toBe(true)
    expect(dialog.attributes('show')).toBe('true')
  })

  it('forwards prefix updates from the dialog as update:prefix', async () => {
    const wrapper = mount(PostPrefixItem, {
      props: { prefix: 'old' },
      global: { stubs: { TextInputDialog: true } },
    })

    const dialog = wrapper.findComponent({ name: 'TextInputDialog' })
    dialog.vm.$emit('update:text', 'new prefix')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:prefix')?.[0]).toEqual(['new prefix'])
  })
})
