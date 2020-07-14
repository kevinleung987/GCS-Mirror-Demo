import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { firebaseConfig } from './../environments/firebaseConfig';
import { AngularFireStorage } from '@angular/fire/storage';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  items: Observable<any[]>;
  prefixes: Observable<any[]>;
  blobPath = '';
  displayedColumns: string[] = ['id', 'size', 'type', 'updated'];
  constructor(
    private firestore: AngularFirestore,
    private storage: AngularFireStorage
  ) {
    this.items = this.firestore
      .collection('gcs-mirror')
      .doc(firebaseConfig.storageBucket)
      .collection('items')
      .valueChanges({
        idField: 'id',
      })
      .pipe(map((result) => result.filter((doc) => doc.deletedTime == null)));
    this.prefixes = this.firestore
      .collection('gcs-mirror')
      .doc(firebaseConfig.storageBucket)
      .collection('prefixes')
      .valueChanges({
        idField: 'id',
      })
      .pipe(map((result) => result.filter((doc) => doc.deletedTime == null)));

    this.items.subscribe((data) => console.log(data));
  }

  uploadBlob(): void {
    const file = new Uint8Array([0x00, 0x00]);
    console.log(this.blobPath);
    const ref = this.storage.ref(this.blobPath);
    const task = ref.put(file);
  }

  formatBytes(bytes, decimals = 2): string {
    if (bytes === 0) {
      return '0 Bytes';
    }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}
