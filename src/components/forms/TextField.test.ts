import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TextField from './TextField.vue'

const baseProps = {
  value: '',
  name: 'fld',
  title: 'Field',
  type: 'text',
}

describe('TextField', () => {
  it('renders the title and value', () => {
    const wrapper = mount(TextField, {
      props: { ...baseProps, value: 'hello' },
    })
    expect(wrapper.find('label').text()).toBe('Field')
    expect(wrapper.find('input').element.value).toBe('hello')
  })

  it('emits update:value when the input changes', async () => {
    const wrapper = mount(TextField, { props: baseProps })
    await wrapper.find('input').setValue('typed')
    const events = wrapper.emitted('update:value')
    expect(events?.[0]).toEqual(['typed'])
  })

  it('shows the error message and marks aria-invalid when an error is provided', () => {
    const wrapper = mount(TextField, {
      props: { ...baseProps, error: 'Required' },
    })
    expect(wrapper.find('p.text-red-600').text()).toBe('Required')
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
  })

  it('respects readonly and disabled props', () => {
    const wrapper = mount(TextField, {
      props: { ...baseProps, readonly: true, disabled: true },
    })
    const input = wrapper.find('input').element
    expect(input.readOnly).toBe(true)
    expect(input.disabled).toBe(true)
  })
})
