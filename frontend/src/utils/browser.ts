export function isSafariAgent(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  // Detect Safari but exclude Chrome/Chromium, Edge, Opera and iOS Chrome/Firefox
  return /Safari/.test(ua) && !/Chrome|Chromium|CriOS|FxiOS|Edg|OPR/.test(ua)
}

export function isMobileSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return /iPhone|iPad|iPod/.test(ua) && /Safari/.test(ua) && !/CriOS|FxiOS/.test(ua)
}

export default { isSafariAgent, isMobileSafari }