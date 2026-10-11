import { useEffect, useId, useRef } from "react";
import "./Lightbox.css";

const Lightbox = ({ images, activeIndex, onClose, onNavigate }) => {
  const dialogRef = useId();
  const closeRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const onNavigateRef = useRef(onNavigate);
  const image = images[activeIndex];

  onCloseRef.current = onClose;
  onNavigateRef.current = onNavigate;

  useEffect(() => {
    closeRef.current?.focus();
  }, [activeIndex]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
      if (event.key === "ArrowRight") {
        onNavigateRef.current(1);
      }
      if (event.key === "ArrowLeft") {
        onNavigateRef.current(-1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  if (!image) {
    return null;
  }

  return (
    <div
      className="lightbox"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="lightbox__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogRef}
      >
        <button
          ref={closeRef}
          type="button"
          className="lightbox__close"
          aria-label="Close lightbox"
          onClick={onClose}
        >
          ×
        </button>

        <button
          type="button"
          className="lightbox__nav lightbox__nav--prev"
          aria-label="Previous image"
          onClick={() => onNavigate(-1)}
        >
          ‹
        </button>

        <figure className="lightbox__figure">
          <img
            src={image.url}
            alt={image.title || "Gallery image"}
            width="1200"
            height="900"
          />
        </figure>

        <button
          type="button"
          className="lightbox__nav lightbox__nav--next"
          aria-label="Next image"
          onClick={() => onNavigate(1)}
        >
          ›
        </button>

        <div className="lightbox__meta">
          <div>
            <strong id={dialogRef}>
              {image.photographer || image.title || "Gallery image"}
            </strong>
            <p>
              {[image.location, image.category, image.title]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <p aria-live="polite">
            {activeIndex + 1} / {images.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Lightbox;
