export enum BOX_TYPES {
  INBOX = "inbox",
  SENT = "sent",
  JUNK = "junk",
  ARCHIVE = "archive",
}

export type ErrorMessage = {
  response: {
    data: {
      message: string;
    };
  };
};
