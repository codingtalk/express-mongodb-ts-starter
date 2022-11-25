import bcryptjs from 'bcryptjs';
import validator from 'validator';
import mongoose, { Schema, Model, Document, HookNextFunction } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface UserDocument extends Document {
    uuid: string,
    username: string;
    password: string;
    avatar: string;
    email: string;
}



const UserSchema: Schema<UserDocument> = new Schema({
    uuid: String,
    username: {
        type: String,
        required: [true, 'username is required'],
        minlength: [6, 'min length is 6'],
        maxlength: [12, 'max length is 12'],
        trim: true,
    },
    password: String,
    avatar: String,
    email: {
        type: String,
        validate: {
            validator: validator.isEmail
        },
        trim: true,
    }
}, {
    timestamps: true,
    toJSON: { // To hidde sensitive fields
        transform: function (_doc: any, result: any) {
            result.id = result._id;
            delete result._id;
            delete result.__v;
            delete result.password;
            delete result.createdAt;
            delete result.updatedAt;
            return result;
        }
    }
})

UserSchema.pre<UserDocument>('save', async function (next: HookNextFunction) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        this.uuid = uuidv4(); // Generate user identifer automaticly
        this.password = await bcryptjs.hash(this.password, 10); // encrypt user password
        next();
    } catch (error) {
        next(error);
    }
});

interface UserModel<T extends Document> extends Model<T> { }

export const User: UserModel<UserDocument> = mongoose.model<UserDocument, UserModel<UserDocument>>('User', UserSchema);