import { DiscogsDiggerPage } from './app.po';

describe('discogs-digger App', () => {
  let page: DiscogsDiggerPage;

  beforeEach(() => {
    page = new DiscogsDiggerPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
