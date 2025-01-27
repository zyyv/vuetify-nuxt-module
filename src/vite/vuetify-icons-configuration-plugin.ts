import type { Plugin } from 'vite'
import type { ResolvedIcons } from '../utils/icons'
import {
  RESOLVED_VIRTUAL_VUETIFY_ICONS_CONFIGURATION,
  VIRTUAL_VUETIFY_ICONS_CONFIGURATION,
} from './constants'

export function vuetifyIconsPlugin(
  isDev: boolean,
  resolvedIcons: ResolvedIcons,
) {
  const iconsOptionsPromise = prepareIcons()

  return <Plugin>{
    name: 'vuetify:icons-configuration:nuxt',
    enforce: 'pre',
    resolveId(id) {
      if (id === VIRTUAL_VUETIFY_ICONS_CONFIGURATION)
        return RESOLVED_VIRTUAL_VUETIFY_ICONS_CONFIGURATION
    },
    async load(id) {
      if (id === RESOLVED_VIRTUAL_VUETIFY_ICONS_CONFIGURATION) {
        if (!resolvedIcons.enabled) {
          // no idea how to disable icons in vuetify
          return `export const isDev = ${isDev}
export function iconsConfiguration() {
  return { defaultSet: undefined }
}
`
        }

        const { aliases, fa, defaultSet, imports, sets } = await iconsOptionsPromise

        if (!defaultSet) {
          return `export const isDev = ${isDev}
export function iconsConfiguration() {
  return { defaultSet: undefined }
}
`
        }

        return `${imports}

export const isDev = ${isDev}
export function iconsConfiguration() {
${fa.map(f => `  ${f}`).join('\n')}
  return {
    defaultSet: '${defaultSet}',
    ${aliases}
    sets: { ${sets} }
  }
}
`
      }
    },
  }

  async function prepareIcons(): Promise<{
    fa: string[]
    defaultSet?: string
    imports: string
    sets: string
    aliases: string
  }> {
    if (!resolvedIcons.enabled) {
      return {
        defaultSet: undefined,
        imports: '',
        sets: '',
        aliases: '',
        fa: [],
      }
    }

    let aliases = 'aliases,'
    const alias = resolvedIcons.aliases
    if (alias.length) {
      aliases = `aliases: {
      ...aliases,
      ${alias.join(',\n')}
    },
`
    }

    return {
      fa: resolvedIcons.svg?.fa ?? [],
      defaultSet: resolvedIcons.defaultSet,
      imports: Object.values(resolvedIcons.imports).join('\n'),
      sets: resolvedIcons.sets.join(','),
      aliases,
    }
  }
}
