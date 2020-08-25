export interface ItemDocument {
  id: string;
  lastEvent: string;
  gcsMetadata: any;
}

export interface PrefixDocument {
  id: string;
  lastEvent: string;
  childRef: string;
}

export type MirrorDocument = ItemDocument | PrefixDocument;
