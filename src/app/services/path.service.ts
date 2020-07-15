import { Injectable } from '@angular/core';

import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class PathService {
  constructor(private config: ConfigService) {}

  getGCSUrl(path: string): string {
    return `gs://${this.config.bucket}/${path}`;
  }

  getFirestorePath(path: string): string {
    const parts = path.split('/').filter((a) => a.length > 0);
    let firestorePath = `${this.config.firestoreRoot}/`;
    parts.forEach(
      (part) => (firestorePath += `${this.config.prefixes}/${part}`)
    );
    return firestorePath;
  }
}
