import mongoose, { Schema, Model, Document } from 'mongoose';

export interface FileAccessDocument extends Document {
    fileUUID: string,
    userUUID: string,
    type: string,
    path: string, // When type equals `UPDATE`, path's value `a.a-1` means `userUUID` what key it could update or remove
    status: string
}



const FileAccessSchema: Schema<FileAccessDocument> = new Schema({
    fileUUID: String,
    userUUID: String,
    type: {
        type: String,
        enum: ['UPDATE', 'READ'],
    },
    path: String,
    status: {
        type: String,
        enum: ['OK', 'EXPIRED'],
    }
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

interface FileAccessModel<T extends Document> extends Model<T> { }

export const FileAccess: FileAccessModel<FileAccessDocument> = mongoose.model<FileAccessDocument, FileAccessModel<FileAccessDocument>>('FileAccess', FileAccessSchema);