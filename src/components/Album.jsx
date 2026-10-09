import { useEffect, useState } from "react";

// Material UI
import { Button, Grid } from "@mui/material";

const API_URL = "https://jsonplaceholder.typicode.com/photos";
const MAX_IMAGES = 50;
const PAGE_SIZE = 1000;

const getUniqueEvenAlbumImages = (data) => {
  const albumIds = new Set();

  return data.filter((image) => {
    if (image.albumId % 2 !== 0 || albumIds.has(image.albumId)) {
      return false;
    }

    albumIds.add(image.albumId);
    return true;
  });
};

const Album = () => {
  const max = MAX_IMAGES;

  // Use State for Images.
  const [images, setImages] = useState([]);
  const [limit, setLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(0);
  const [page, setPage] = useState(0);

  // Fetch once on mount, and again only when the user explicitly retries.
  useEffect(() => {
    const controller = new AbortController();
    let isCurrentRequest = true;

    const fetchImages = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_URL}?_start=${page * PAGE_SIZE}&_limit=${PAGE_SIZE}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Unable to load images.");
        }

        const data = await response.json();

        if (isCurrentRequest) {
          setImages((currentImages) => {
            const loadedAlbumIds = new Set(
              currentImages.map((image) => image.albumId)
            );

            return [
              ...currentImages,
              ...getUniqueEvenAlbumImages(data).filter(
                (image) => !loadedAlbumIds.has(image.albumId)
              ),
            ];
          });
        }
      } catch (requestError) {
        if (isCurrentRequest && requestError.name !== "AbortError") {
          setError("Unable to load images. Please try again.");
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      }
    };

    fetchImages();

    return () => {
      isCurrentRequest = false;
      controller.abort();
    };
  }, [page, requestId]);

  // Handle Load More Button to show 10 more until 50 max
  const handleShowMoreImages = (e) => {
    e.preventDefault();
    if (limit < max) {
      setLimit((currentLimit) => currentLimit + 10);
      if (limit >= images.length) {
        setPage((currentPage) => currentPage + 1);
      }
    }
  };

  const handleRetry = () => {
    setRequestId((currentRequestId) => currentRequestId + 1);
  };

  return (
    <div>
      <Grid container spacing={6} justify="center" style={{ marginTop: 50 }}>
        {isLoading && <p role="status">Loading images...</p>}
        {error && (
          <div role="alert">
            <p>{error}</p>
            <Button onClick={handleRetry} variant="contained">
              Retry
            </Button>
          </div>
        )}

        { // Slice to get only 10 images intially
        images.slice(0, limit).map((album, index) => (
          <Grid item key={album.id} xs={12} sm={6} md={4}>
            <img
              className="albumImg"
              src={album.url}
              alt={album.title || "Gallery image"}
              width="600"
              height="600"
              loading={index < 3 ? "eager" : "lazy"}
              onError={(event) => {
                event.currentTarget.alt = "Image unavailable";
                event.currentTarget.style.visibility = "hidden";
              }}
            />
          </Grid>
        ))}

          <Grid item xs={12} style={{ margin: 20, textAlign: "center" }} >
          {
            // Hide button when 50 Images
          limit < max &&
          <Button disabled={isLoading} onClick={handleShowMoreImages} style={{ margin: 20 }} variant="contained">
            Load More
          </Button>
        }
          </Grid>

      </Grid>

    </div>
  );
};

export default Album;
