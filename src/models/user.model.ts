import { Schema, model } from 'mongoose';
import { User } from '../interfaces/user.interface';

const userSchema = new Schema<User>({
        username: { type: String, required: true, unique: true, minlength: 3, maxlength: 30 },
        password: { type: String, required: true, minlength: 8, maxlength: 255 },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
        registrationDate: { type: Date, required: true, default: Date.now }
    })

export const userModel = model<User>('User', userSchema);