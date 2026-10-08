import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import AddToHomeSheet from './AddToHomeSheet'

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function isIOS() {
  const ua = navigator.userAgent
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
  )
}

function AddToHomeButton() {
  const [installed, setInstalled] = useState(isStandalone)
  const [sheetOpen, setSheetOpen] = useState(false)
  const deferredPrompt = useRef(null)
  const btnRef = useRef(null)

  useEffect(() => {
    function onBeforeInstall(e) {
      e.preventDefault()
      deferredPrompt.current = e
    }
    function onInstalled() {
      deferredPrompt.current = null
      setInstalled(true)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  async function handleClick() {
    gsap.fromTo(
      btnRef.current,
      { scale: 0.94 },
      { scale: 1, duration: 0.3, ease: 'back.out(2)' }
    )

    const promptEvent = deferredPrompt.current
    if (promptEvent) {
      deferredPrompt.current = null
      promptEvent.prompt()
      const { outcome } = await promptEvent.userChoice
      if (outcome === 'accepted') setInstalled(true)
      return
    }
    setSheetOpen(true)
  }

  if (installed) return null

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="pills__add"
        onClick={handleClick}
      >
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add to home screen
      </button>
      {sheetOpen &&
        createPortal(
          <AddToHomeSheet ios={isIOS()} onClose={() => setSheetOpen(false)} />,
          document.body
        )}
    </>
  )
}

export default AddToHomeButton
