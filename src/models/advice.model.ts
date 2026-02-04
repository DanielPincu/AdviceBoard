import { Schema, model } from 'mongoose';
import { Advice } from '../interfaces/advice.interface';

const adviceSchema = new Schema({
  title: { type: String, required: true, minlength: 3, maxlength: 120 },
  content: { type: String, required: true, minlength: 3, maxlength: 2000 },
  createdAt: { type: Date, default: Date.now, required: true },
  anonymous: { type: Boolean, required: true },
  _createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  replies: [
    {
      content: { type: String, required: true, minlength: 1, maxlength: 2000 },
      createdAt: { type: Date, default: Date.now, required: true },
      anonymous: { type: Boolean, required: true, default: false },
      _createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
    }
  ]
});

export const AdviceModel = model<Advice>('Advice', adviceSchema);