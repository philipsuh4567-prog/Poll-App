import { useRef } from 'react'
import gsap from 'gsap'

function Header({ searchQuery, onSearchChange }) {
  const logoRef = useRef(null)

  function handleLogoEnter() {
    gsap.fromTo(
      logoRef.current,
      { rotation: -12, scale: 1.1 },
      { rotation: 0, scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.4)' }
    )
  }

  return (
    <header className="header">
      <h1 className="header__logo">
        <img
          ref={logoRef}
          src={`${import.meta.env.BASE_URL}logo-64.png`}
          alt="Polly"
          width="36"
          height="36"
          onMouseEnter={handleLogoEnter}
        />
      </h1>
      <div className="header__search">
        <svg
          className="header__search-icon"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.6" />
          <line
            x1="13.6"
            y1="13.6"
            x2="18"
            y2="18"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="search"
          inputMode="search"
          placeholder="Search polly"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search polly"
        />
      </div>
    </header>
  )
}

export default Header
