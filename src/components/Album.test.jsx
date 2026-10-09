import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import Album from "./Album";

vi.mock("@mui/material", () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
  Grid: ({ children }) => <div>{children}</div>,
}));

const photos = Array.from({ length: 24 }, (_, index) => ({
  id: index + 1,
  albumId: index + 1,
  title: `Photo ${index + 1}`,
  url: `https://example.test/${index + 1}.jpg`,
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

  it("loads and displays one image from each even album", async () => {
    fetch.mockResolvedValue(successfulResponse());

    render(<Album />);

    expect(await screen.findByAltText("Photo 2")).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(10);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("does not refetch when Load More changes only the display limit", async () => {
    fetch.mockResolvedValue(successfulResponse());

    render(<Album />);

    await screen.findByAltText("Photo 2");
    fireEvent.click(screen.getByRole("button", { name: "Load More" }));

    expect(screen.getAllByRole("img")).toHaveLength(12);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("shows an error and retries after a failed request", async () => {
    fetch
      .mockRejectedValueOnce(new Error("network unavailable"))
      .mockResolvedValueOnce(successfulResponse());

    render(<Album />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to load images. Please try again."
    );
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByAltText("Photo 2")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("aborts the active request on unmount and ignores its stale response", async () => {
    let resolveRequest;
    fetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        })
    );

    const { unmount } = render(<Album />);
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
