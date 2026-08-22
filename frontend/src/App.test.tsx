import { render, screen } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "./App";

vi.mock("axios");

const mockedAxios = vi.mocked(axios, true);

describe("App", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the foundation page and reports an available API", async () => {
    mockedAxios.get.mockResolvedValue({ data: { status: "ok" } });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: /textile & garment management system/i }),
    ).toBeInTheDocument();
    expect(await screen.findByText("API connection available")).toBeInTheDocument();
  });

  it("shows a clear unavailable state when the API cannot be reached", async () => {
    mockedAxios.get.mockRejectedValue(new Error("network unavailable"));
    mockedAxios.isCancel.mockReturnValue(false);

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByText("API connection unavailable")).toBeInTheDocument();
  });
});

