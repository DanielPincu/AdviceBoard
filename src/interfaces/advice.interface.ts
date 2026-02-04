import { User } from './user.interface';
import { Reply } from './reply.interface';

export interface Advice {
  title: string;
  content: string;
  createdAt: Date;
  anonymous: boolean;
  _createdBy: User['id'];
  replies: Reply[];
}