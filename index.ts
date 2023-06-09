import { Server } from "./lib/server";

const s = new Server();
s.use(null, async (req, res) => {
  // console.log('for all requests', req.parsedUrl?.pathname);
});

s.use('/', async (req, res) => {
  res.json({
    message: 'request handled!!'
  })
});

s.use('/foo/bar', async (req, res) => {
  res.json('Fooo Baaar');
});

s.use('/get/:id', async (req, res) => {
  res.end(`Here's object id ${req?.params?.id}`)
});

(async () => {
  await s.startServer(3000);
})();
