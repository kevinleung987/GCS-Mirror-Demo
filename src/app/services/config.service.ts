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
    this.bucket =
      localStorage.getItem('bucket') ?? firebaseConfig.storageBucket;
    this.firestoreRoot =
      localStorage.getItem('firestoreRoot') ?? `gcs-mirror/${this.bucket}`;
    this.items = localStorage.getItem('items') ?? 'items';
    this.prefixes = localStorage.getItem('prefixes') ?? 'prefixes';
  }

  setKey(change: { key: string; value: string }): void {
    if (this[change.key] !== change.value) {
      this[change.key] = change.value;
      localStorage.setItem(change.key, change.value);
      console.log('changed');
    }
  }

  setDefaults(): void {
    this.setKey({key: 'firestoreRoot', value: `gcs-mirror/${this.bucket}`});
    this.setKey({key: 'items', value: 'items'});
    this.setKey({key: 'prefixes', value: 'prefixes'});
  }
}
