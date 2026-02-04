import { User } from './user.interface';
import { Reply } from './reply.interface';

export interface Advice {
  title: string;
  content: string;
  createdAt: Date;
  anonymous: boolean;
  _createdBy?: User['id'] | { _id: User['id']; username: string };
  replies: Reply[];
}