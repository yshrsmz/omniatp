import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SignOutDialog from './SignOutDialog.vue'
import { headlessuiStubs } from '../../test/headlessui-stubs'

const mountDialog = (show = true) =>
  mount(SignOutDialog, {
    props: { show },
    global: { stubs: headlessuiStubs },
  })

describe('SignOutDialog', () => {
  it('does not render the panel content when show is false', () => {
    const wrapper = mountDialog(false)
    expect(wrapper.text()).not.toContain('Are you sure to sign out?')
  })

  it('renders the confirmation copy when show is true', () => {
    const wrapper = mountDialog(true)
    expect(wrapper.text()).toContain('Are you sure to sign out?')
  })

  it('emits signout and update:show=false when the Sign out button is clicked', async () => {
    const wrapper = mountDialog(true)
    const buttons = wrapper.findAll('button')
    const signOutButton = buttons.find((b) => b.text() === 'Sign out')!
    await signOutButton.trigger('click')

    expect(wrapper.emitted('signout')).toHaveLength(1)
    expect(wrapper.emitted('update:show')?.[0]).toEqual([false])
  })

  it('emits update:show=false when CLOSE is clicked', async () => {
    const wrapper = mountDialog(true)
    const buttons = wrapper.findAll('button')
    const closeButton = buttons.find((b) => b.text() === 'CLOSE')!
    await closeButton.trigger('click')

    expect(wrapper.emitted('signout')).toBeUndefined()
    expect(wrapper.emitted('update:show')?.[0]).toEqual([false])
  })
})
