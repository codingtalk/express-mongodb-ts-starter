import mongoose, { Schema, Model, Document, HookNextFunction } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface FileDocument extends Document {
    creatorUserUUID: string,
    uuid: string,
    title: string,
    description: string,
    content: object
}



export const FileSchema: Schema<FileDocument> = new Schema({
    creatorUserUUID: String,
    uuid: String,
    sn: String,
    title: {
        type: String,
        required: [true, 'title is required'],
    },
    description: {
        type: String,
        required: [true, 'description is required'],
    },
    content: Object
}, {
    timestamps: true,
    toJSON: {
        transform: function (_doc: any, result: any) {
            result.id = result._id;
            delete result._id;
            delete result.__v;
            delete result.createdAt;
            delete result.updatedAt;
            return result;
        }
    }
});

FileSchema.pre<FileDocument>('save', async function (next: HookNextFunction) {
    try {
        this.uuid = uuidv4();
        next();
    } catch (error) {
        next(error);
    }
});

interface FileModel<T extends Document> extends Model<T> { }

export const File: FileModel<FileDocument> = mongoose.model<FileDocument, FileModel<FileDocument>>('File', FileSchema);