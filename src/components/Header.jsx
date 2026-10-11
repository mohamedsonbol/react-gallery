import { useEffect, useId, useState } from "react";
import "./Header.css";

const NAV_LINKS = [
  { href: "#gallery", label: "Explore" },
  { href: "#collections", label: "Collections" },
  { href: "#about", label: "About" },
];

const Header = ({ searchQuery, onSearchChange }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuId = useId();
  const searchId = useId();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const handleNavClick = () => setIsMenuOpen(false);

  return (
    <header className={`site-header${isScrolled ? " is-scrolled" : ""}`}>
      <div className="site-header__inner">
        <a className="brand" href="#top" aria-label="FRAME home">
          <span className="brand__mark">FRAME</span>
          <span className="brand__dot" aria-hidden="true" />
        </a>

        <nav className="site-nav" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <div className="header-search">
            <span className="header-search__icon" aria-hidden="true">
              ⌕
            </span>
            <input
              id={searchId}
              type="search"
              name="gallery-search"
              placeholder="Search frames"
              aria-label="Search frames"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>

          <button
            type="button"
            className="menu-toggle"
            aria-expanded={isMenuOpen}
            aria-controls={menuId}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span className="menu-toggle__bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      <div
        id={menuId}
        className={`mobile-nav${isMenuOpen ? " is-open" : ""}`}
        hidden={!isMenuOpen}
      >
        <div className="mobile-nav__inner">
          <div className="mobile-search">
            <span aria-hidden="true">⌕</span>
            <input
              id={`${searchId}-mobile`}
              type="search"
              name="gallery-search-mobile"
              placeholder="Search frames"
              aria-label="Search frames"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
          <nav aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} onClick={handleNavClick}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
