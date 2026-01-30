import { extractWikiLinks } from '../services/backlinkService';

describe('backlinkService', () => {
  describe('extractWikiLinks', () => {
    it('should extract [[slug]] style links', () => {
      const content = 'Check out [[my-article]] and [[another-article]] for more info.';
      const links = extractWikiLinks(content);
      expect(links).toEqual(['my-article', 'another-article']);
    });

    it('should extract markdown links to internal articles', () => {
      const content = 'See [this article](/wiki/my-article) and [another](other-slug).';
      const links = extractWikiLinks(content);
      expect(links).toContain('my-article');
      expect(links).toContain('other-slug');
    });

    it('should not extract external links', () => {
      const content = 'Visit [Google](https://google.com) or [Email](mailto:test@test.com).';
      const links = extractWikiLinks(content);
      expect(links).toEqual([]);
    });

    it('should remove duplicates', () => {
      const content = 'See [[my-article]] and again [[my-article]].';
      const links = extractWikiLinks(content);
      expect(links).toEqual(['my-article']);
    });

    it('should handle empty content', () => {
      const links = extractWikiLinks('');
      expect(links).toEqual([]);
    });

    it('should handle content with no links', () => {
      const content = 'This is just regular text without any wiki links.';
      const links = extractWikiLinks(content);
      expect(links).toEqual([]);
    });

    it('should trim whitespace from links', () => {
      const content = 'See [[  spaced-slug  ]] here.';
      const links = extractWikiLinks(content);
      expect(links).toEqual(['spaced-slug']);
    });

    it('should handle mixed link styles', () => {
      const content = 'See [[wiki-style]] and [markdown style](/wiki/md-style) and [plain](plain-slug).';
      const links = extractWikiLinks(content);
      expect(links).toContain('wiki-style');
      expect(links).toContain('md-style');
      expect(links).toContain('plain-slug');
    });
  });
});
