export class PieceNotFoundError extends Error {
  constructor(slug: string) {
    super(`Piece "${slug}" not found`);
    this.name = "PieceNotFoundError";
  }
}
