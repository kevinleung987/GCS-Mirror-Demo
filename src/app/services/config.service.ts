import { Injectable } from '@angular/core';
import { firebaseConfig } from './../../environments/firebaseConfig';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  bucket: string;
  firestoreRoot: string;
  prefixes: string;
  items: string;
  constructor() {
    // TODO: Configurable?
    this.bucket = firebaseConfig.storageBucket;
    this.firestoreRoot = `gcs-mirror/${this.bucket}`;
    this.prefixes = 'prefixes';
    this.items = 'items';
  }
}
