export function getProfileUserInfo() {
  return new Promise<chrome.identity.UserInfo>((resolve) => {
    chrome.identity.getProfileUserInfo(resolve)
  })
}

export function getAuthToken(details?: chrome.identity.TokenDetails) {
  const _details = details ?? { interactive: false }
  return new Promise<
    [string, undefined] | [undefined, chrome.runtime.LastError]
  >((resolve, reject) => {
    chrome.identity.getAuthToken(_details, async function (token) {
      if (chrome.runtime.lastError || !token) {
        resolve([undefined, chrome.runtime.lastError])
        return
      }
      resolve([token, undefined])
    })
  })
}

export function getAuthTokenInteractive() {
  return getAuthToken({ interactive: true })
}

export function refreshAuthToken(token: string) {
  return removeCachedAuthToken(token).then(() => getAuthToken())
}

export function removeCachedAuthToken(token: string) {
  return new Promise<void>((resolve) => {
    chrome.identity.removeCachedAuthToken(
      {
        token
      },
      resolve
    )
  })
}

export function clearAllCachedAuthTokens() {
  return new Promise<void>((resolve) => {
    chrome.identity.clearAllCachedAuthTokens(resolve)
  })
}
