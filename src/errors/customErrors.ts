export class UserExistsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserExistsError';
  }
}

export class InternalServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InternalServerError';
  }
}

export class NoFileUploadedError extends Error {
  constructor(message: string = 'No file uploaded') {
    super(message);
    this.name = 'NoFileUploadedError';
  }
}

export class MessageNotFoundError extends Error {
  constructor(message: string = 'Message not found') {
    super(message);
    this.name = 'MessageNotFoundError';
  }
}

export class UnsupportedMessageTypeError extends Error {
  constructor(message: string = 'Unsupported message type') {
    super(message);
    this.name = 'UnsupportedMessageTypeError';
  }
}

export class FileNotFoundError extends Error {
  constructor(message: string = 'File not found') {
    super(message);
    this.name = 'FileNotFoundError';
  }
}