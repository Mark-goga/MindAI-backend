type TestSuiteOptions = {
  skipCloseServer?: boolean;
};

const fn = () => {};

export function createBaseTestSuits({ skipCloseServer = false }: TestSuiteOptions = {}): void {
  afterEach(() => {
    vitest.clearAllMocks();
  });

  if (!skipCloseServer) {
    afterAll(async () => {
      await fn();
    });
  }
}
