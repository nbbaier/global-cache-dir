import { rm } from 'node:fs/promises'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'
import { env, platform } from 'node:process'

import test from 'ava'
import globalCacheDir from 'global-cache-dir'
import { pathExists } from 'path-exists'
import { each } from 'test-each'

const getName = () => String(Math.random()).replace('.', '')

const setXdgCacheHome = (xdgCacheHome) => {
  if (xdgCacheHome === undefined) {
    Reflect.deleteProperty(env, 'XDG_CACHE_HOME')
    return
  }

  Reflect.set(env, 'XDG_CACHE_HOME', xdgCacheHome)
}

const withXdgCacheHome = async (xdgCacheHome, run) => {
  const previousXdgCacheHome = env.XDG_CACHE_HOME
  setXdgCacheHome(xdgCacheHome)

  try {
    return await run()
  } finally {
    setXdgCacheHome(previousXdgCacheHome)
  }
}

const getExpectedDefaultDir = (name) => {
  if (platform === 'darwin') {
    return join(homedir(), 'Library', 'Caches', name)
  }

  if (platform === 'linux') {
    return join(homedir(), '.cache', name)
  }
}

test.serial('should respect XDG_CACHE_HOME on macOS and Linux', async (t) => {
  const name = getName()
  const xdgCacheHome = join(tmpdir(), `global-cache-dir-test-${getName()}`)

  try {
    const cacheDir = await withXdgCacheHome(xdgCacheHome, () =>
      globalCacheDir(name),
    )
    const isXdgPlatform = platform !== 'win32'
    const expectedCacheDir = join(xdgCacheHome, name)
    t.is(cacheDir === expectedCacheDir, isXdgPlatform)
    t.true(await pathExists(cacheDir))
  } finally {
    await rm(xdgCacheHome, { recursive: true, force: true })
  }
})

each([undefined, ''], ({ title }, xdgCacheHome) => {
  test.serial(
    `should use OS default when XDG_CACHE_HOME is unset or empty | ${title}`,
    async (t) => {
      const name = getName()
      const cacheDir = await withXdgCacheHome(xdgCacheHome, () =>
        globalCacheDir(name),
      )
      const expectedDefaultDir = getExpectedDefaultDir(name)

      if (expectedDefaultDir !== undefined) {
        t.is(cacheDir, expectedDefaultDir)
      }

      t.true(await pathExists(cacheDir))
      await rm(cacheDir, { recursive: true, force: true })
    },
  )
})

each([undefined, '', '*'], ({ title }, name) => {
  test.serial(
    `should validate name when XDG_CACHE_HOME is set | ${title}`,
    async (t) => {
      const xdgCacheHome = join(tmpdir(), `global-cache-dir-test-${getName()}`)
      await withXdgCacheHome(xdgCacheHome, async () => {
        await t.throwsAsync(globalCacheDir(name))
      })
    },
  )
})

test('should return the cache directory', async (t) => {
  const name = getName()
  const cacheDir = await globalCacheDir(name)
  t.is(typeof cacheDir, 'string')
})

test('should ensure the cache directory exists', async (t) => {
  const name = getName()
  const cacheDir = await globalCacheDir(name)
  t.true(await pathExists(cacheDir))
})

test('should work if the cache directory already exists', async (t) => {
  const name = getName()
  const cacheDir = await globalCacheDir(name)
  t.true(await pathExists(cacheDir))

  const cacheDirA = await globalCacheDir(name)
  t.true(await pathExists(cacheDirA))
})

each([undefined, '', '*'], ({ title }, name) => {
  test(`should validate name | ${title}`, async (t) => {
    await t.throwsAsync(globalCacheDir(name))
  })
})
