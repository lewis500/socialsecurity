// @flow
export type Dot = { id: string, year: number, earnings: number };
export type RawDatum = {
  year: number,
  cap: number,
  index: number,
  awi: number
};
export type Datum = {  year: number,
  cap: number,
  index: number,
  awi: number,
  earnings: number,
  earningsAdjusted: number,
  earningsCapped: number,
  counted: boolean
};
