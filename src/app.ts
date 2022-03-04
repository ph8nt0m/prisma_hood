import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import morgan from 'morgan';

const prisma = new PrismaClient();

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

app.get('/posts', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
    });
    res.json(posts);
  } catch (err) {
    console.log('error: ', err);
  }
});

app.get(`/post/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findUnique({
      where: { id: Number(id) },
    });
    res.json(post);
  } catch (err) {
    console.log('error: ', err);
  }
});

app.post(`/post`, async (req, res) => {
  try {
    const { title, content, path } = req.body;
    const result = await prisma.post.create({
      data: {
        title,
        content,
        published: true,
        path,
      },
    });
    res.json(result);
  } catch (err) {
    console.log('error: ', err);
  }
});

app.put('/post/publish/:id', async (req, res) => {
  const { id } = req.params;
  const post = await prisma.post.update({
    where: { id: Number(id) },
    data: { published: true },
  });
  res.json(post);
});

app.delete(`/post/:id`, async (req, res) => {
  const { id } = req.params;
  const post = await prisma.post.delete({
    where: { id: Number(id) },
  });
  res.json(post);
});

// const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } });
const storage = multer.diskStorage({
  //경로 설정
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },

  //실제 저장되는 파일명 설정
  filename: function (req, file, cb) {
    //파일명 설정을 돕기 위해 요청정보(req)와 파일(file)에 대한 정보를 전달함
    console.log('req', file);
    const testSn = file.originalname;

    const today = new Date();

    //Multer는 어떠한 파일 확장자도 추가하지 않습니다.
    //사용자 함수는 파일 확장자를 온전히 포함한 파일명을 반환해야 합니다.
    let mimeType;

    switch (file.mimetype) {
      case 'image/jpeg':
        mimeType = 'jpg';
        break;
      case 'image/png':
        mimeType = 'png';
        break;
      case 'image/gif':
        mimeType = 'gif';
        break;
      case 'image/bmp':
        mimeType = 'bmp';
        break;
      default:
        mimeType = 'jpg';
        break;
    }

    cb(null, testSn + '_' + today.getHours() + today.getMinutes() + today.getSeconds() + today.getMilliseconds() + '.' + mimeType);
  },
});

const upload = multer({ storage: storage });
app.post('/upload', upload.single('img'), (req, res) => {
  const path = { path: req.file?.path };
  res.json(path);
});

app.listen('8000', () => {
  console.log(`
  ################################################
  🛡️  Server listening on port: 8000
  ################################################
`);
});
