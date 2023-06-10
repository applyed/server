import { Server, server } from "..";

describe('Index', () => {
  it('Should create a server', () => {
    const s = server();
    expect(s).toBeInstanceOf(Server);
  });
});
