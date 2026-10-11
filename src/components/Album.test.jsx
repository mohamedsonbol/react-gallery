import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import Album from "./Album";

const photos = Array.from({ length: 50 }, (_, index) => ({
  id: index + 1,
  albumId: (index + 1) * 2,
  title: `Gallery image ${index + 1}`,
  url: `/images/gallery-tile.svg?image=${index + 1}`,
  category: ["Landscape", "Portrait", "Street", "Architecture", "Nature"][index % 5],
  location: "Studio",
  photographer: "FRAME",
  aspect: "square",
}));

const successfulResponse = (data = photos) => ({
  ok: true,
  json: vi.fn().mockResolvedValue(data),
});

describe("Album", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("loads the first local fixture page with descriptive image names", async () => {
    fetch.mockResolvedValue(successfulResponse());

    render(<Album searchQuery="" onSearchChange={() => {}} />);

    expect(await screen.findByAltText("Gallery image 1")).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(10);
    expect(fetch).toHaveBeenCalledWith("/data/gallery.json", expect.any(Object));
  });

  it("loads the next bounded page when Load More changes the display limit", async () => {
    fetch.mockResolvedValue(successfulResponse());

    render(<Album searchQuery="" onSearchChange={() => {}} />);

    await screen.findByAltText("Gallery image 1");
    fireEvent.click(screen.getByRole("button", { name: "Load More" }));

    expect(await screen.findByAltText("Gallery image 20")).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(20);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("announces an error and retries after a local data failure", async () => {
    fetch
      .mockRejectedValueOnce(new Error("network unavailable"))
      .mockResolvedValueOnce(successfulResponse());

    render(<Album searchQuery="" onSearchChange={() => {}} />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to load images. Please try again."
    );
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByAltText("Gallery image 1")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("replaces a failed image with an accessible placeholder", async () => {
    fetch.mockResolvedValue(successfulResponse());

    render(<Album searchQuery="" onSearchChange={() => {}} />);
    fireEvent.error(await screen.findByAltText("Gallery image 1"));

    expect(
      screen.getByRole("img", { name: "Image unavailable: Gallery image 1" })
    ).toHaveTextContent("Image unavailable");
  });

  it("aborts the active local data request on unmount", async () => {
    let resolveRequest;
    fetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        })
    );

    const { unmount } = render(<Album searchQuery="" onSearchChange={() => {}} />);
    const signal = fetch.mock.calls[0][1].signal;

    unmount();

    expect(signal.aborted).toBe(true);

    await act(async () => {
      resolveRequest(successfulResponse());
      await Promise.resolve();
    });

    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
