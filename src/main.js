import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { env, platform } from 'node:process'

import getCacheDir from 'cachedir'
import { pathExists } from 'path-exists'

// Get the global cache directory
const globalCacheDir = async (name) => {
  const cacheDir = getCacheDirPath(name)
  await createCacheDir(cacheDir)
  return cacheDir
}

export default globalCacheDir

const getCacheDirPath = (name) => {
  const defaultCacheDir = getCacheDir(name)
  return platform !== 'win32' && env.XDG_CACHE_HOME
    ? join(env.XDG_CACHE_HOME, name)
    : defaultCacheDir
}

const createCacheDir = async (cacheDir) => {
  if (await pathExists(cacheDir)) {
    return
  }

  await mkdir(cacheDir, { recursive: true })
}
