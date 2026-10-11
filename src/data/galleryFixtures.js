const DATA_URL = "/data/gallery.json";
const PAGE_SIZE = 10;

export const loadGalleryPage = async (page, signal) => {
  const response = await fetch(DATA_URL, { signal });

  if (!response.ok) {
    throw new Error("Unable to load images.");
  }

  const images = await response.json();
  return images.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
};

export { PAGE_SIZE };
