export type BadRequestErrorDetail = {
  field: string;
  message: string;
};

export class BadRequestError extends Error {
  public readonly details?: BadRequestErrorDetail[];

  constructor(message: string, details?: BadRequestErrorDetail[]) {
    super(message);
    this.name = "Bad Request Error";
    this.details = details;
  }
}
