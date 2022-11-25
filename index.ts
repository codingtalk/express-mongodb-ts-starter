import 'dotenv/config';
import path from 'path';
import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import errorMiddleware from './middleware/error';
import authMiddleware from './middleware/auth';
import HttpException from './exception/HttpException';

const app: Express = express();


app.use(cors());
app.use(morgan('dev'));
app.use(helmet());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, 'public')));

app.use(authMiddleware);
app.use('/', require('./controllers/index'));
app.use((_req: Request, _res: Response, next: NextFunction) => {
    const error: HttpException = new HttpException(404, 'URL Not Found');
    next(error);
});
app.use(errorMiddleware);

(async function () {
    await mongoose.set('useNewUrlParser', true);
    await mongoose.set('useUnifiedTopology', true);
    const MONGODB_URL = process.env.MONGODB_URL || `mongodb://localhost/test`;
    await mongoose.connect(MONGODB_URL);
    const PORT = process.env.PORT || 8001;
    app.listen(PORT, () => {
        console.log(`Running on http://localhost:${PORT}`);
    })
})();