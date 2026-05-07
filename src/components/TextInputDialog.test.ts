import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TextInputDialog from './TextInputDialog.vue'
import { headlessuiStubs } from '../test/headlessui-stubs'

const baseProps = {
  show: true,
  text: 'initial',
  title: 'Edit Prefix',
  name: 'prefix',
  type: 'text',
  label: 'Prefix',
}

type DialogProps = typeof baseProps & { cancelable?: boolean }
const mountDialog = (overrides: Partial<DialogProps> = {}) =>
  mount(TextInputDialog, {
    props: { ...baseProps, ...overrides },
    global: { stubs: headlessuiStubs },
  })

describe('TextInputDialog', () => {
  it('renders the dialog title when show is true', () => {
    const wrapper = mountDialog()
    expect(wrapper.text()).toContain('Edit Prefix')
  })

  it('does not render the dialog content when show is false', () => {
    const wrapper = mountDialog({ show: false })
    expect(wrapper.text()).not.toContain('Edit Prefix')
  })

  it('emits update:text and update:show=false when SAVE is clicked', async () => {
    const wrapper = mountDialog()
    await wrapper.find('input').setValue('changed')

    const saveButton = wrapper
      .findAll('button')
      .find((b) => b.text() === 'SAVE')!
    await saveButton.trigger('click')

    expect(wrapper.emitted('update:text')?.[0]).toEqual(['changed'])
    expect(wrapper.emitted('update:show')?.[0]).toEqual([false])
  })

  it('shows a CLOSE button only when cancelable', () => {
    const wrapper = mountDialog({ cancelable: true })
    const buttonTexts = wrapper.findAll('button').map((b) => b.text())
    expect(buttonTexts).toContain('CLOSE')
  })

  it('hides the CLOSE button when not cancelable', () => {
    const wrapper = mountDialog({ cancelable: false })
    const buttonTexts = wrapper.findAll('button').map((b) => b.text())
    expect(buttonTexts).not.toContain('CLOSE')
  })
})
