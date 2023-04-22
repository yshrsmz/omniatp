import { Developer } from './data/model/Developer'

export const BskyConfig = {
  service: 'https://bsky.social',
  maxPostLength: 300,
}

export const AppConfig = {
  developer: {
    name: '@codingfeline.com',
    url: 'https://bsky.app/profile/codingfeline.com',
  } satisfies Developer,
}
