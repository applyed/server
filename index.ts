import { Server } from "./lib/server";

const s = new Server();
s.use(async (req, res) => {
  if(!req.cookies()?.foo)
    res.cookie('foo', 'bar');
});

s.use('/', async (req, res) => {
  res.send({
    message: 'request handled!!'
  })
});

s.use('/foo/bar', async (req, res) => {
  res.send('Fooo Baaar');
});

s.use('/get/:id', async (req, res) => {
  res.end(`Here's object id ${req?.params?.id}`)
});

(async () => {
  await s.startServer(3000);
})();
