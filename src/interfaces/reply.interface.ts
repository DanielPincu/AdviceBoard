export interface Reply {
  id: string;
  content: string;
  createdAt: Date;
  anonymous: boolean;
  _createdBy: string; // user id later (auth)
}