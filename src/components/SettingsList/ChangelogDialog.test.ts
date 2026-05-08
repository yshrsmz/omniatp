import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ChangelogDialog from './ChangelogDialog.vue'
import type { Changelog } from '../../data/model/Changelog'
import { headlessuiStubs } from '../../test/headlessui-stubs'

const sampleChangelog: Changelog = {
  releases: [
    {
      version: '0.0.4',
      versionUrl: 'https://example.com/compare',
      date: '2026-05-08',
      sections: [
        {
          title: 'Features',
          items: [
            {
              scope: 'share',
              description: 'rewrite Amazon URLs with associate tag',
              links: [
                { text: '#92', url: 'https://example.com/i92' },
                { text: '3ec4370', url: 'https://example.com/c3ec' },
              ],
            },
          ],
        },
      ],
    },
  ],
}

const mountDialog = (changelog: Changelog = sampleChangelog, show = true) =>
  mount(ChangelogDialog, {
    props: { show, changelog },
    global: { stubs: headlessuiStubs },
  })

describe('ChangelogDialog', () => {
  it('does not render content when show is false', () => {
    const wrapper = mountDialog(sampleChangelog, false)
    expect(wrapper.text()).not.toContain('Changelog')
  })

  it('renders the version, date and section title', () => {
    const wrapper = mountDialog()
    expect(wrapper.text()).toContain('0.0.4')
    expect(wrapper.text()).toContain('2026-05-08')
    expect(wrapper.text()).toContain('Features')
  })

  it('renders the item description, scope and links', () => {
    const wrapper = mountDialog()
    expect(wrapper.text()).toContain('share:')
    expect(wrapper.text()).toContain('rewrite Amazon URLs with associate tag')
    const anchors = wrapper.findAll('a')
    const hrefs = anchors.map((a) => a.attributes('href'))
    expect(hrefs).toContain('https://example.com/compare')
    expect(hrefs).toContain('https://example.com/i92')
    expect(hrefs).toContain('https://example.com/c3ec')
  })

  it('shows an empty-state message when there are no releases', () => {
    const wrapper = mountDialog({ releases: [] })
    expect(wrapper.text()).toContain('No releases yet.')
  })

  it('emits update:show=false when Close is clicked', async () => {
    const wrapper = mountDialog()
    const closeButton = wrapper
      .findAll('button')
      .find((b) => b.text() === 'Close')!
    await closeButton.trigger('click')
    expect(wrapper.emitted('update:show')?.[0]).toEqual([false])
  })

  it('renders inline code and bold markdown inside item descriptions', () => {
    const changelog: Changelog = {
      releases: [
        {
          version: '0.1.0',
          versionUrl: undefined,
          date: '2026-05-08',
          sections: [
            {
              title: 'Features',
              items: [
                {
                  scope: undefined,
                  description:
                    'use `Property<String>` and the **important** flag',
                  links: [],
                },
              ],
            },
          ],
        },
      ],
    }
    const wrapper = mountDialog(changelog)
    const codeEl = wrapper.find('code')
    expect(codeEl.exists()).toBe(true)
    expect(codeEl.text()).toBe('Property<String>')
    const boldEls = wrapper.findAll('strong')
    const importantBold = boldEls.find((el) => el.text() === 'important')
    expect(importantBold?.exists()).toBe(true)
    expect(wrapper.text()).not.toContain('`Property<String>`')
    expect(wrapper.text()).not.toContain('**important**')
  })
})
