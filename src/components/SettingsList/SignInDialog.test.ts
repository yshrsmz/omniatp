import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SignInDialog from './SignInDialog.vue'
import { AuthProgress } from '../../data/model/AuthProgress'
import { headlessuiStubs } from '../../test/headlessui-stubs'

const mountDialog = (
  overrides: Partial<{
    show: boolean
    service: string
    progress: AuthProgress
  }> = {}
) =>
  mount(SignInDialog, {
    props: {
      show: true,
      service: 'https://bsky.social',
      progress: AuthProgress.UNAUTHORIZED(),
      ...overrides,
    },
    global: { stubs: headlessuiStubs },
  })

const inputByName = (wrapper: ReturnType<typeof mountDialog>, name: string) =>
  wrapper.find(`input[name="${name}"]`)

const submitButton = (wrapper: ReturnType<typeof mountDialog>) =>
  wrapper.findAll('button').find((b) => b.text() === 'Sign in')!

describe('SignInDialog', () => {
  it('disables the Sign in button until both fields are filled', async () => {
    const wrapper = mountDialog()
    expect(submitButton(wrapper).attributes('disabled')).toBeDefined()

    await inputByName(wrapper, 'identifier').setValue('me.bsky.social')
    await wrapper.find('form').trigger('input')
    expect(submitButton(wrapper).attributes('disabled')).toBeDefined()

    await inputByName(wrapper, 'password').setValue('hunter2')
    await wrapper.find('form').trigger('input')
    expect(submitButton(wrapper).attributes('disabled')).toBeUndefined()
  })

  it('emits signin with the entered credentials on submit', async () => {
    const wrapper = mountDialog()
    await inputByName(wrapper, 'identifier').setValue('me.bsky.social')
    await inputByName(wrapper, 'password').setValue('hunter2')
    await wrapper.find('form').trigger('input')
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.emitted('signin')?.[0]?.[0]).toEqual({
      identifier: 'me.bsky.social',
      password: 'hunter2',
    })
  })

  it('does not emit signin when fields are blank', async () => {
    const wrapper = mountDialog()
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.emitted('signin')).toBeUndefined()
  })

  it('emits update:show=false when Cancel is clicked', async () => {
    const wrapper = mountDialog()
    const cancelButton = wrapper
      .findAll('button')
      .find((b) => b.text() === 'Cancel')!
    await cancelButton.trigger('click')
    expect(wrapper.emitted('update:show')?.[0]).toEqual([false])
  })

  it('renders the error message when progress is ERROR', () => {
    const wrapper = mountDialog({
      progress: AuthProgress.ERROR('Invalid credentials'),
    })
    expect(wrapper.text()).toContain('Invalid credentials')
  })

  it('disables inputs while authentication is in progress', () => {
    const wrapper = mountDialog({ progress: AuthProgress.IN_PROGRESS() })
    expect(
      inputByName(wrapper, 'identifier').attributes('disabled')
    ).toBeDefined()
    expect(
      inputByName(wrapper, 'password').attributes('disabled')
    ).toBeDefined()
  })
})
