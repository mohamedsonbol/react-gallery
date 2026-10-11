import { useEffect, useId, useMemo, useState } from "react";
import { loadGalleryPage } from "../data/galleryFixtures";
import Lightbox from "./Lightbox";
import "./Album.css";

const MAX_IMAGES = 50;
const CATEGORIES = ["All", "Landscape", "Portrait", "Street", "Architecture", "Nature"];

const Album = ({ searchQuery = "", onSearchChange }) => {
  const [images, setImages] = useState([]);
  const [limit, setLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(0);
  const [page, setPage] = useState(0);
  const [unavailableImageIds, setUnavailableImageIds] = useState(new Set());
  const [category, setCategory] = useState("All");
  const [activeIndex, setActiveIndex] = useState(null);
  const searchFieldId = useId();

  useEffect(() => {
    const controller = new AbortController();
    let isCurrentRequest = true;

    const loadImages = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await loadGalleryPage(page, controller.signal);

        if (isCurrentRequest) {
          setImages((currentImages) => [...currentImages, ...data]);
        }
      } catch {
        if (isCurrentRequest) {
          setError("Unable to load images. Please try again.");
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      }
    };

    loadImages();

    return () => {
      isCurrentRequest = false;
      controller.abort();
    };
  }, [page, requestId]);

  const visibleImages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return images.slice(0, limit).filter((image) => {
      const matchesCategory = category === "All" || image.category === category;
      const haystack = [image.title, image.category, image.location, image.photographer]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = !query || haystack.includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [images, limit, category, searchQuery]);

  const handleShowMoreImages = () => {
    if (limit < MAX_IMAGES) {
      setLimit((currentLimit) => currentLimit + 10);
      if (limit >= images.length) {
        setPage((currentPage) => currentPage + 1);
      }
    }
  };

  const handleRetry = () => {
    setRequestId((currentRequestId) => currentRequestId + 1);
  };

  const handleImageError = (id) => {
    setUnavailableImageIds((currentIds) => new Set(currentIds).add(id));
  };

  const openLightbox = (imageId) => {
    const index = visibleImages.findIndex((image) => image.id === imageId);
    if (index >= 0) {
      setActiveIndex(index);
    }
  };

  const navigateLightbox = (direction) => {
    setActiveIndex((current) => {
      if (current == null || visibleImages.length === 0) {
        return current;
      }
      return (current + direction + visibleImages.length) % visibleImages.length;
    });
  };

  return (
    <>
      <section id="gallery" className="gallery" aria-labelledby="gallery-heading">
        <header className="gallery__header">
          <span className="section-label">Gallery</span>
          <h2 id="gallery-heading" className="gallery__title">
            A living archive of contemporary frames
          </h2>
          <p className="gallery__lede">
            Filter by mood, search by place or maker, and open any image into a
            quiet fullscreen study.
          </p>
        </header>

        <div className="gallery__toolbar">
          <div className="gallery__filters" role="group" aria-label="Filter by category">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                className={`filter-chip${category === item ? " is-active" : ""}`}
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="gallery__search">
            <span aria-hidden="true">⌕</span>
            <input
              id={searchFieldId}
              type="search"
              name="gallery-filter-search"
              placeholder="Search title, place, or photographer"
              aria-label="Search gallery"
              value={searchQuery}
              onChange={(event) => onSearchChange?.(event.target.value)}
            />
          </div>
        </div>

        <div className="gallery__status-row">
          {isLoading && <p role="status">Loading images...</p>}
          {!isLoading && !error && (
            <p role="status">
              Showing {visibleImages.length} of {Math.min(limit, images.length)} loaded frames
            </p>
          )}
        </div>

        {error && (
          <div className="gallery__error">
            <p role="alert">{error}</p>
            <button type="button" className="button-secondary" onClick={handleRetry}>
              Retry
            </button>
          </div>
        )}

        <div className="masonry">
          {visibleImages.map((album, index) => {
            const aspect = album.aspect || "square";
            return (
              <div className="masonry__item" key={album.id} style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}>
                {unavailableImageIds.has(album.id) ? (
                  <div
                    className={`imagePlaceholder photo-card--${aspect}`}
                    role="img"
                    aria-label={`Image unavailable: ${album.title || "Gallery image"}`}
                  >
                    Image unavailable
                  </div>
                ) : (
                  <button
                    type="button"
                    className={`photo-card photo-card--${aspect}`}
                    onClick={() => openLightbox(album.id)}
                    aria-label={`Open ${album.title || "Gallery image"} in lightbox`}
                  >
                    <img
                      className="albumImg"
                      src={album.url}
                      alt={album.title || "Gallery image"}
                      width="600"
                      height="600"
                      loading={index < 3 ? "eager" : "lazy"}
                      onError={() => handleImageError(album.id)}
                    />
                    <span className="photo-card__meta">
                      <span className="photo-card__photographer">
                        {album.photographer || "Unknown photographer"}
                      </span>
                      <span className="photo-card__details">
                        <span>{album.location || "Unknown location"}</span>
                        <span className="photo-card__sep" aria-hidden="true">
                          ·
                        </span>
                        <span>{album.category || "Gallery"}</span>
                      </span>
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="gallery__footer">
          {limit < MAX_IMAGES && (
            <button
              type="button"
              className="button-secondary"
              disabled={isLoading}
              onClick={handleShowMoreImages}
            >
              Load More
            </button>
          )}
          <p>
            {Math.min(limit, MAX_IMAGES)} / {MAX_IMAGES} frames in this collection
          </p>
        </div>
      </section>

      <section id="collections" className="collections-band" aria-labelledby="collections-heading">
        <span className="section-label">Collections</span>
        <h2 id="collections-heading">Curated sequences</h2>
        <p>
          Soft groupings for browsing — the same local fixtures, arranged for an
          editorial rhythm rather than a dense dashboard.
        </p>
        <ul className="collections-list">
          <li>
            <strong>Horizon Lines</strong>
            <span>Landscape studies</span>
          </li>
          <li>
            <strong>Quiet Streets</strong>
            <span>Urban observation</span>
          </li>
          <li>
            <strong>Near Light</strong>
            <span>Portrait &amp; interior</span>
          </li>
        </ul>
      </section>

      <section id="about" className="about-band" aria-labelledby="about-heading">
        <span className="section-label">About</span>
        <h2 id="about-heading">Made for looking longer</h2>
        <p>
          FRAME is a photography discovery surface built on the existing React
          Gallery app — local data, resilient loading, and keyboard-friendly
          viewing, dressed in a calmer editorial shell.
        </p>
      </section>

      {activeIndex != null && (
        <Lightbox
          images={visibleImages}
          activeIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
          onNavigate={navigateLightbox}
        />
      )}
    </>
  );
};

export default Album;
