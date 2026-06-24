import { clearCookies } from '@/test-utils/cookies'
import { beforeEach, describe, expect, it, vi } from 'vitest'

async function importAuthStore() {
  const { useAuthStore } = await import('./auth-store')
  return useAuthStore
}

const sampleUser = {
  accountNo: 'ACC-1',
  email: 'user@example.com',
  role: ['user'],
  exp: 1_700_000_000,
}

describe('useAuthStore', () => {
  beforeEach(() => {
    clearCookies()
    vi.resetModules()
  })

  it('starts with an empty access token when nothing is persisted', async () => {
    const useAuthStore = await importAuthStore()

    expect(useAuthStore.getState().auth.user).toBeNull()
  })

  it('persists access token so a new store instance reads it back', async () => {

    vi.resetModules()

    
  })

  it('clears persisted access token when resetAccessToken is used', async () => {

    vi.resetModules()

  })

  it('updates the signed-in user via setUser', async () => {
    const useAuthStore = await importAuthStore()


    expect(useAuthStore.getState().auth.user).toEqual(sampleUser)
  })

  it('reset clears user and access token and drops persistence', async () => {
    const useAuthStore = await importAuthStore()

    useAuthStore.getState().auth.reset()

    expect(useAuthStore.getState().auth.user).toBeNull()

    vi.resetModules()
    const useAuthStoreAfterReload = await importAuthStore()

    expect(useAuthStoreAfterReload.getState().auth.user).toBeNull()
  })
})
