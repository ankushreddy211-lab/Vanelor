export class DropNotLiveError extends Error {
  constructor(slug: string, actualStatus: string) {
    super(`Drop "${slug}" is not live (currently ${actualStatus})`);
    this.name = "DropNotLiveError";
  }
}

export class DropNotFoundError extends Error {
  constructor(slug: string) {
    super(`Drop "${slug}" not found`);
    this.name = "DropNotFoundError";
  }
}
