import { ResilientHttpClient } from "@/src/core/roble/ResilientHttpClient";

const response = (status = 200): Response =>
  ({
    status,
    ok: status >= 200 && status < 300,
    clone: () => response(status),
  }) as Response;

describe("ResilientHttpClient", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it("deduplicates parallel GETs and clones the response for each caller", async () => {
    const fetchMock = jest.spyOn(global, "fetch").mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(response()), 0)),
    );

    const [first, second] = await Promise.all([
      ResilientHttpClient.request("https://roble.test/read?tableName=proyecto"),
      ResilientHttpClient.request("https://roble.test/read?tableName=proyecto"),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(first).not.toBe(second);
  });

  it("limits simultaneous requests to two", async () => {
    let active = 0;
    let maximumActive = 0;
    const releases: (() => void)[] = [];
    jest.spyOn(global, "fetch").mockImplementation(
      () => new Promise((resolve) => {
        active += 1;
        maximumActive = Math.max(maximumActive, active);
        releases.push(() => {
          active -= 1;
          resolve(response());
        });
      }),
    );

    const requests = Array.from({ length: 5 }, (_, index) =>
      ResilientHttpClient.request(`https://roble.test/read?id=${index}`),
    );
    for (let index = 0; index < 5; index += 1) {
      while (!releases[index]) await new Promise((resolve) => setTimeout(resolve, 0));
      releases[index]();
    }

    await Promise.all(requests);
    expect(maximumActive).toBe(2);
  });

  it("retries server errors using exponential backoff", async () => {
    jest.useFakeTimers();
    const fetchMock = jest.spyOn(global, "fetch")
      .mockResolvedValueOnce(response(500))
      .mockResolvedValueOnce(response(500))
      .mockResolvedValueOnce(response());

    const request = ResilientHttpClient.request("https://roble.test/read?tableName=proyecto");
    await jest.advanceTimersByTimeAsync(3600);

    await expect(request).resolves.toMatchObject({ status: 200 });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
