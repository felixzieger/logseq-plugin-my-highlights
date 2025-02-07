
import { parseClipping, parseTitleLine, parseMetaLine, parseKindleHighlights } from "./parseKindleHighlights";

const CLIPPING_1 = `How to Take Smart Notes: One Simple Technique to Boost Writing, Learning and Thinking – for Students, Academics and Nonfiction Book Writers (Ahrens, Sönke)
- Your Highlight on page 2 | Location 129-130 | Added on Tuesday, August 17, 2021 5:53:38 AM

writing down of the argument is the smallest part of its development`;

const BOOKMARK_CLIPPING = `How to Take Smart Notes: One Simple Technique to Boost Writing, Learning and Thinking – for Students, Academics and Nonfiction Book Writers (Ahrens, Sönke)
- Your Bookmark on page 23 | Location 506 | Added on Wednesday, August 18, 2021 6:40:32 AM

`;

const NOTE_CLIPPING = `Effective Notetaking (Study Skills Book 1) (McPherson, Fiona)
- Your Note on page 7 | Location 64 | Added on Monday, August 23, 2021 6:52:21 AM

Thinking about a subject before reading about it can increase retention.`;

const CLIPPING_1_GERMAN = `The Almanack of Naval Ravikant: A Guide to Wealth and Happiness (Eric Jorgenson)
- Ihre Markierung auf Seite 26 | bei Position 394-395 | Hinzugefügt am Dienstag, 28. März 2023 07:56:29

So, technology is the set of things, as Alan Kay said, that don’t quite work yet [correction: Danny Hillis]. Once something works, it’s no longer technology.`;


describe('parseKindleHighlights', () => {
  describe('parseKindleHighlights', () => {
    it('should combine highlights from the same book', () => {
      const result = parseKindleHighlights([CLIPPING_1, BOOKMARK_CLIPPING, NOTE_CLIPPING].join('\n==========\n'));
      expect(result).toHaveLength(2);
    });
  });

  describe('parseMetaLine', () => {
    describe('English', () => {
      const META_LINE = '- Your Note on page 7 | Location 64 | Added on Monday, August 23, 2021 6:52:21 AM';

      it('should parse type', () => {
        const result = parseMetaLine(META_LINE);
        expect(result).toHaveProperty('type', 'Note');
      });

      it('should parse page', () => {
        const result = parseMetaLine(META_LINE);
        expect(result).toHaveProperty('page', 7);
      });

      it('should parse location start', () => {
        const result = parseMetaLine(META_LINE);
        expect(result).toHaveProperty('location.start', 64);
      });

      it('should parse location end', () => {
        const result = parseMetaLine('- Your Highlight on page 2 | Location 129-130 | Added on Tuesday, August 17, 2021 5:53:38 AM');
        expect(result).toHaveProperty('location.end', 130);
      });

      it('should parse timestamp', () => {
        const result = parseMetaLine(META_LINE);
        expect(result).toHaveProperty('timestamp', new Date(Date.parse('Monday, August 23, 2021 6:52:21 AM')));
      });
    });

    describe('Chinese', () => {
      const META_LINE = '- 您在位置 #1920-1921的标注 | 添加于 2022年6月6日星期一 下午4:09:21';

      it('should parse without failing', () => {
        expect(() => parseMetaLine(META_LINE)).not.toThrow();
      });
    });

    describe('German', () => {
      const META_LINE = '- Ihre Markierung auf Seite 26 | bei Position 394-395 | Hinzugefügt am Dienstag, 28. März 2023 07:56:29';

      it('should parse without failing', () => {
        expect(() => parseMetaLine(META_LINE)).not.toThrow();
      });
    });
  });
  describe('parseTitleLine', () => {
    it('should parse title', () => {
      const result = parseTitleLine('Effective Notetaking (Study Skills Book 1) (McPherson, Fiona)');
      expect(result).toHaveProperty('title', 'Effective Notetaking (Study Skills Book 1)');
    });

    it('should parse author', () => {
      const result = parseTitleLine('Effective Notetaking (Study Skills Book 1) (McPherson, Fiona)');
      
      expect(result).toHaveProperty('authors', expect.arrayContaining(['McPherson, Fiona']));
    });
  });

  describe('parseClipping', () => {
    it('should parse book title', () => {
      const result = parseClipping(CLIPPING_1);
      expect(result).toHaveProperty('title', 'How to Take Smart Notes: One Simple Technique to Boost Writing, Learning and Thinking – for Students, Academics and Nonfiction Book Writers');
    });

    it('should parse author name', () => {
      const result = parseClipping(CLIPPING_1);
      expect(result).toHaveProperty('authors', expect.arrayContaining(['Ahrens, Sönke']));
    });

    it('should parse timestamp', () => {
      const result = parseClipping(CLIPPING_1);
      expect(result).toHaveProperty('timestamp', new Date(Date.parse('August 17, 2021 5:53:38 AM')));
    });

    it('should parse page number', () => {
      const result = parseClipping(CLIPPING_1);
      expect(result).toHaveProperty('page', 2);
    });

    it('should parse start location', () => {
      const result = parseClipping(CLIPPING_1);
      expect(result).toHaveProperty('location.start', 129);
    });

    it('should parse end location', () => {
      const result = parseClipping(CLIPPING_1);
      expect(result).toHaveProperty('location.end', 130);
    });
  });

  describe('parseClippingGerman', () => {
    it('should parse book title', () => {
      const result = parseClipping(CLIPPING_1_GERMAN);
      expect(result).toHaveProperty('title', 'The Almanack of Naval Ravikant: A Guide to Wealth and Happiness');
    });

    it('should parse author name', () => {
      const result = parseClipping(CLIPPING_1_GERMAN);
      expect(result).toHaveProperty('authors', expect.arrayContaining(['Eric Jorgenson']));
    });

    it('should parse timestamp', () => {
      const result = parseClipping(CLIPPING_1_GERMAN);
      expect(result).toHaveProperty('timestamp', new Date(Date.parse('2023-03-28T05:56:29.000Z')));
    });

    it('should parse page number', () => {
      const result = parseClipping(CLIPPING_1_GERMAN);
      expect(result).toHaveProperty('page', 26);
    });

    it('should parse start location', () => {
      const result = parseClipping(CLIPPING_1_GERMAN);
      expect(result).toHaveProperty('location.start', 394);
    });

    it('should parse end location', () => {
      const result = parseClipping(CLIPPING_1_GERMAN);
      expect(result).toHaveProperty('location.end', 395);
    });
  });
});