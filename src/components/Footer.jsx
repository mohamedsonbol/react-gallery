import "./Footer.css";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div>
          <p className="site-footer__brand">FRAME</p>
          <p className="site-footer__copy">
            A refined space for discovering photography — composed with calm
            typography, generous space, and images that carry the narrative.
          </p>
        </div>

        <nav className="site-footer__nav" aria-label="Footer">
          <a href="#gallery">Explore</a>
          <a href="#collections">Collections</a>
          <a href="#about">About</a>
        </nav>

        <div className="site-footer__social" aria-label="Social">
          <a href="https://instagram.com" rel="noreferrer" target="_blank">
            Instagram
          </a>
          <a href="https://behance.net" rel="noreferrer" target="_blank">
            Behance
          </a>
          <a href="https://github.com/mohamedsonbol/react-gallery" rel="noreferrer" target="_blank">
            GitHub
          </a>
        </div>

        <div className="site-footer__meta">
          <span>Photography discovery</span>
          <span>© {new Date().getFullYear()} FRAME</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
