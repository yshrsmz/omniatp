import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import BaseDialog from './BaseDialog.vue'
import { headlessuiStubs } from '../test/headlessui-stubs'

const PANEL_TEXT = 'panel content'

const mountDialog = (
  props: { show: boolean; static?: boolean } = { show: true }
) =>
  mount(BaseDialog, {
    props,
    slots: {
      default: () => h('div', { class: 'panel' }, PANEL_TEXT),
    },
    global: { stubs: headlessuiStubs },
  })

describe('BaseDialog', () => {
  it('does not render the slot when show is false', () => {
    const wrapper = mountDialog({ show: false })
    expect(wrapper.text()).not.toContain(PANEL_TEXT)
  })

  it('renders the slot when show is true', () => {
    const wrapper = mountDialog({ show: true })
    expect(wrapper.text()).toContain(PANEL_TEXT)
  })

  it('emits update:show=false on close when not static', async () => {
    const wrapper = mountDialog({ show: true, static: false })
    await wrapper.findComponent({ name: 'Dialog' }).trigger('click')
    expect(wrapper.emitted('update:show')?.[0]).toEqual([false])
  })

  it('does not emit update:show on close when static is true', async () => {
    const wrapper = mountDialog({ show: true, static: true })
    await wrapper.findComponent({ name: 'Dialog' }).trigger('click')
    expect(wrapper.emitted('update:show')).toBeUndefined()
  })
})
