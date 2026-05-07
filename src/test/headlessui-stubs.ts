import { defineComponent, h } from 'vue'

const passthrough = (name: string) =>
  defineComponent({
    name,
    inheritAttrs: false,
    setup(_props, { slots, attrs }) {
      return () => h('div', attrs, slots.default ? slots.default() : [])
    },
  })

const conditional = (name: string) =>
  defineComponent({
    name,
    inheritAttrs: false,
    props: { show: { type: Boolean, default: true } },
    setup(props, { slots, attrs, emit }) {
      return () => {
        if (!props.show) return null
        // Mimic Headless UI's `@close` by exposing a click on a sentinel element.
        const children = slots.default ? slots.default() : []
        return h('div', { ...attrs, onClick: () => emit('close') }, children)
      }
    },
  })

export const headlessuiStubs = {
  TransitionRoot: conditional('TransitionRoot'),
  TransitionChild: passthrough('TransitionChild'),
  Dialog: conditional('Dialog'),
  DialogPanel: passthrough('DialogPanel'),
  DialogTitle: passthrough('DialogTitle'),
}
