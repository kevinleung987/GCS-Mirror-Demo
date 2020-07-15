export interface ItemDocument {
  id: string;
  lastEvent: string;
  deletedTime: null;
  gcsMetadata: any;
}

export interface PrefixDocument {
  id: string;
  lastEvent: string;
  deletedTime: null;
  childRef: string;
}
export type MirrorDocument = ItemDocument | PrefixDocument;
