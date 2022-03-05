import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import morgan from 'morgan';
import cors from 'cors';

const prisma = new PrismaClient();

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(cors());

app.get('/posts', async (req, res) => {
  try {
    const { type } = req.query;
    if (type === 'info') {
      const posts = await prisma.infopost.findMany({
        where: { published: true },
      });
      res.json(posts);
    } else if (type === 'cert') {
      const posts = await prisma.certpost.findMany({
        where: { published: true },
      });
      res.json(posts);
    }
  } catch (err) {
    console.log('error: ', err);
  }
});

app.get(`/post/:id`, async (req, res) => {
  try {
    const { id } = req.params;

    const { type } = req.query;

    if (type === 'info') {
      const post = await prisma.infopost.findUnique({
        where: { id: Number(id) },
      });
      res.json(post);
    } else if (type === 'cert') {
      const post = await prisma.certpost.findUnique({
        where: { id: Number(id) },
      });
      res.json(post);
    }
  } catch (err) {
    console.log('error: ', err);
  }
});

app.post(`/post`, async (req, res) => {
  try {
    const { title, content, path, type } = req.body;
    if (type === 'info') {
      const result = await prisma.infopost.create({
        data: {
          title,
          content,
          published: true,
          path,
        },
      });
      res.json(result);
    } else if (type === 'cert') {
      const result = await prisma.certpost.create({
        data: {
          title,
          content,
          published: true,
          path,
        },
      });
      res.json(result);
    }
  } catch (err) {
    console.log('error: ', err);
  }
});

app.put('/post/publish/:id', async (req, res) => {
  const { id } = req.params;
  const { type } = req.query;

  if (type === 'info') {
    const post = await prisma.infopost.update({
      where: { id: Number(id) },
      data: { published: true },
    });
    res.json(post);
  } else if (type === 'cert') {
    const post = await prisma.certpost.update({
      where: { id: Number(id) },
      data: { published: true },
    });
    res.json(post);
  }
});

app.delete(`/post/:id`, async (req, res) => {
  const { id } = req.params;
  const { type } = req.query;
  if (type === 'info') {
    const post = await prisma.infopost.delete({
      where: { id: Number(id) },
    });
    res.json(post);
  } else if (type === 'cert') {
    const post = await prisma.certpost.delete({
      where: { id: Number(id) },
    });
    res.json(post);
  }
});

// const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } });
const storage = multer.diskStorage({
  // 경로 설정
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },

  // 실제 저장되는 파일명 설정
  filename(req, file, cb) {
    // 파일명 설정을 돕기 위해 요청정보(req)와 파일(file)에 대한 정보를 전달함
    console.log('reqq', file);
    const testSn = decodeURI(file.originalname);

    const today = new Date();

    // Multer는 어떠한 파일 확장자도 추가하지 않습니다.
    // 사용자 함수는 파일 확장자를 온전히 포함한 파일명을 반환해야 합니다.
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

    cb(null, `${testSn}_${today.getHours()}${today.getMinutes()}${today.getSeconds()}${today.getMilliseconds()}.${mimeType}`);
  },
});

const upload = multer({ storage });
app.post('/upload', upload.single('img'), (req, res) => {
  const path = { path: req.file?.path };
  res.json(path);
  console.log(path);
});

app.listen('8000', () => {
  console.log(`
  ################################################
  🛡️  Server listening on port: 8000
  ################################################
`);
});
