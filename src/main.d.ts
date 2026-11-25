/**
 * Get the global cache directory.
 * Ensures the directory exists.
 * The cache directory location is OS-specific.
 * On macOS and Linux, the `XDG_CACHE_HOME` environment variable is respected
 * when set.
 *
 * @example
 * ```js
 * const cacheDir = await globalCacheDir('myapp')
 * // Depending on the OS:
 * //  => '/Users/ehmicky/Library/Caches/myapp'
 * //  => '/home/ehmicky/.cache/myapp'
 * //  => 'C:\Users\ehmicky\AppData\Local\myapp\Cache'
 * ```
 */
export default function globalCacheDir(name: string): Promise<string>
