import { DdClientPage } from './app.po';

describe('dd-client App', () => {
  let page: DdClientPage;

  beforeEach(() => {
    page = new DdClientPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
