import { AmazonSearchResult } from "../utils/parseAmazonSearchResults";
import { getBookId } from "./getBookId";

export type AnnotationType = 'Highlight' | 'Note' | 'Bookmark';

export interface KindleLocation {
  start: number;
  end?: number;
}

export interface KindleAnnotation {
  timestamp: Date;
  type?: AnnotationType;
  content?: string;
  page?: number;
  location?: KindleLocation;
}

export interface KindleBook extends BookMetadata {
  lastAnnotation: Date;
  bookId: string;
  annotations: Array<KindleAnnotation>;
}

interface BookMetadata extends Partial<AmazonSearchResult> {
  title: string;
  authors?: Array<string>;
}

export const parseTitleLine = (titleLine: string): BookMetadata => {
  const title = titleLine.replace(/\([^)]+\)$/g, '').trim();
  const authorMatches = /\((?<author>[^)]+)\)$/g.exec(titleLine);

  let authors = authorMatches?.groups?.["author"]?.trim()?.split(';');

  if (!authors?.length || authors[0] === 'Unknown') {
    authors = undefined;
  }

  return { title, authors };
}

function ParseTimestampGerman(timestamp:string) {
const germanMonths: { [key: string]: number } = {
  Januar: 0,
  Februar: 1,
  März: 2,
  April: 3,
  Mai: 4,
  Juni: 5,
  Juli: 6,
  August: 7,
  September: 8,
  Oktober: 9,
  November: 10,
  Dezember: 11,
};

const dateParts = timestamp.split(/[\s:]+/);

const day = parseInt(dateParts[0]);
const month:number = germanMonths[dateParts[1]];
const year = parseInt(dateParts[2]);
const hours = parseInt(dateParts[3]);
const minutes = parseInt(dateParts[4]);
const seconds = parseInt(dateParts[5]);

const parsedDate = new Date(year, month, day, hours, minutes, seconds);
console.log(parsedDate)
return parsedDate;
}

export const parseMetaLine = (metaLine: string): KindleAnnotation => {

  // TODO: Remove dependency on english and german keywords
  const typeRx = /^- (?:Your|Ihr|Ihre)\s(?<type>Note|Highlight|Bookmark|Markierung|Notiz|Lesezeichen)/;
  const pageRx = /(?:page|auf Seite)\s+(?<page>\d+)/;
  const locationRx = /(?:Location|bei Position)\s+(?<start>\d+)(-(?<end>\d+))?/;

  const type = typeRx.exec(metaLine)?.groups?.['type'];

  const pageVal = pageRx.exec(metaLine)?.groups?.['page'];
  let page: number | undefined;

  if (pageVal) {
    page = parseInt(pageVal);
  }

  let location: KindleLocation | undefined;
  const locationVal = locationRx.exec(metaLine)?.groups;

  if (locationVal) {
    let start: number | undefined;
    let end: number | undefined;

    if (locationVal['start']) {
      start = parseInt(locationVal['start']);
    }

    if (locationVal['end']) {
      end = parseInt(locationVal['end']);
    }

    if (!start) {
      throw new Error(`Could not find start location in ${locationVal}`);
    }

    location = { start, end };
  }

  let timestamp = new Date();

  const timestampRx = /Added on\s+(?<timestamp>.*)$/;
  const timestampVal = timestampRx.exec(metaLine)?.groups?.['timestamp'];
  if (timestampVal) {
    timestamp = new Date(Date.parse(timestampVal));
  }

  const timestampRxGerman = /Hinzugefügt am \w+,\s+(?<timestamp>.*)$/;
  const timestampValGerman = timestampRxGerman.exec(metaLine)?.groups?.['timestamp'];
  if (timestampValGerman) {
    timestamp = ParseTimestampGerman(timestampValGerman);
  }

  return {
    type,
    page,
    timestamp,
    location,
  } as KindleAnnotation;
}

export const parseClipping = (clipping: string): KindleAnnotation & BookMetadata => {
  const lines = clipping.trim().split(/\n/);
  
  if (lines.length < 2) {
    throw new Error(`Could not parse clipping, not enough lines: ${clipping}`);
  }

  const title = parseTitleLine(lines.shift()!.trim());
  const metadata = parseMetaLine(lines.shift()!.trim());

  const content = lines.join('\n').trim();

  return {
    ...title,
    ...metadata,
    content
  };
}

export const parseKindleHighlights = (content: string): Array<KindleBook> => {
  const clippings = content.split(/^==========$/gm).filter(line => Boolean(line.trim())).map(parseClipping);
  return clippings.reduce((result, clipping) => {
    let book = result.find((b) => b.title === clipping.title && b.author === clipping.author);

    if (!book) {
      book = {
        title: clipping.title,
        authors: clipping.authors,
        annotations: [],
        lastAnnotation: clipping.timestamp,
        bookId: ""
      };
      book.bookId = getBookId(book);
      result.push(book);
    }

    if (book.lastAnnotation < clipping.timestamp) {
      book.lastAnnotation = clipping.timestamp;
    }

    book.annotations.push({
      content: clipping.content,
      location: clipping.location,
      timestamp: clipping.timestamp,
      type: clipping.type,
      page: clipping.page
    });

    return result;
  }, [] as Array<KindleBook>)
    // @ts-ignore
    .sort((a, b) => b.lastAnnotation - a.lastAnnotation);
}