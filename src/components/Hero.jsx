import "./Hero.css";

const Hero = () => {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero__media" aria-hidden="true">
        <img
          src="/images/hero.jpg"
          alt=""
          width="1800"
          height="1200"
          fetchPriority="high"
        />
        <div className="hero__veil" />
      </div>

      <div className="hero__content">
        <p className="hero__brand">FRAME</p>
        <div className="hero__copy">
          <h1 id="hero-heading" className="hero__title">
            Every frame tells a story.
          </h1>
          <p className="hero__intro">
            An editorial gallery of quiet landscapes, lived-in streets, and
            portraits that linger — curated for photographers and curious eyes.
          </p>
          <div className="hero__actions">
            <a className="button button--primary" href="#gallery">
              Explore Gallery
            </a>
            <a className="button button--ghost" href="#collections">
              View Collections
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
