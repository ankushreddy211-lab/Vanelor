export class NotAuthorizedError extends Error {
  constructor(action: string) {
    super(`Not authorized to perform: ${action}`);
    this.name = "NotAuthorizedError";
  }
}
