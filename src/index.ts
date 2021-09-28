import express from 'express';
import { ApiRespository } from './respositories/api-respository';
const app = express();
const port = process.env.PORT || 3000;

const respository = new ApiRespository();
app.get('/api/categories', (_, res) => {
  res.send(respository.getCategories());
});

app.get('/api/entities', (_, res) => {
  res.send(respository.get());
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
