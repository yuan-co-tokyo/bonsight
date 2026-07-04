import { render, screen, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'

type HubCallback = (capsule: { payload: { event: string } }) => void | Promise<void>

const mockFetchAuthSession = vi.hoisted(() => vi.fn())
const mockHubListen = vi.hoisted(() => vi.fn())

vi.mock('aws-amplify/auth', () => ({
  fetchAuthSession: mockFetchAuthSession,
}))

vi.mock('aws-amplify/utils', () => ({
  Hub: { listen: mockHubListen },
}))

vi.mock('./screens/S0Landing', () => ({ default: () => <div>S0Landing</div> }))
vi.mock('./screens/S1Home', () => ({ default: () => <div>S1Home</div> }))
vi.mock('./screens/S2Form', () => ({ default: () => <div>S2Form</div> }))
vi.mock('./screens/S3Detail', () => ({ default: () => <div>S3Detail</div> }))
vi.mock('./screens/S4Upload', () => ({ default: () => <div>S4Upload</div> }))
vi.mock('./screens/S5AiResult', () => ({ default: () => <div>S5AiResult</div> }))
vi.mock('./screens/S6AiChat', () => ({ default: () => <div>S6AiChat</div> }))
vi.mock('./screens/S7Viewer', () => ({ default: () => <div>S7Viewer</div> }))
vi.mock('./screens/S8Settings', () => ({ default: () => <div>S8Settings</div> }))
vi.mock('./api/meApi', () => ({ getMe: vi.fn().mockResolvedValue(null) }))

describe('App Hub.listen', () => {
  let capturedCallback: HubCallback

  beforeEach(() => {
    vi.clearAllMocks()
    mockHubListen.mockImplementation((_channel: string, cb: HubCallback) => {
      capturedCallback = cb
      return vi.fn()
    })
    window.history.pushState({}, '', '/')
  })

  it('signInWithRedirect イベントで fetchAuthSession を呼び authed=true (S1Home表示)', async () => {
    mockFetchAuthSession
      .mockResolvedValueOnce({ tokens: undefined })
      .mockResolvedValueOnce({ tokens: { idToken: 'tok' } })

    render(<App />)
    await waitFor(() => expect(screen.getByText('S0Landing')).toBeInTheDocument())

    await act(async () => {
      await capturedCallback({ payload: { event: 'signInWithRedirect' } })
    })

    expect(mockFetchAuthSession).toHaveBeenCalledTimes(2)
    await waitFor(() => expect(screen.getByText('S1Home')).toBeInTheDocument())
  })

  it('signInWithRedirect_failure イベントで authed=false (S0Landing表示)', async () => {
    mockFetchAuthSession.mockResolvedValueOnce({ tokens: undefined })

    render(<App />)
    await waitFor(() => expect(screen.getByText('S0Landing')).toBeInTheDocument())

    await act(async () => {
      await capturedCallback({ payload: { event: 'signInWithRedirect_failure' } })
    })

    expect(screen.getByText('S0Landing')).toBeInTheDocument()
  })

  it('signInWithRedirect 後に ?code= を URL から除去する', async () => {
    mockFetchAuthSession
      .mockResolvedValueOnce({ tokens: undefined })
      .mockResolvedValueOnce({ tokens: { idToken: 'tok' } })

    window.history.pushState({}, '', '/?code=abc&state=xyz')
    const replaceSpy = vi.spyOn(window.history, 'replaceState')

    render(<App />)
    await waitFor(() => expect(screen.getByText('S0Landing')).toBeInTheDocument())

    await act(async () => {
      await capturedCallback({ payload: { event: 'signInWithRedirect' } })
    })

    expect(replaceSpy).toHaveBeenCalledWith({}, expect.any(String), '/')
  })
})
