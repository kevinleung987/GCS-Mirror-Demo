import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { firebaseConfig } from './../environments/firebaseConfig';
import { AngularFireStorage } from '@angular/fire/storage';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  items: Observable<any[]>;
  blobPath = '';
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
      });
  }

  uploadBlob(): void {
    const file = new Uint8Array([
      0x48,
      0x65,
      0x6c,
      0x6c,
      0x6f,
      0x2c,
      0x20,
      0x77,
      0x6f,
      0x72,
      0x6c,
      0x64,
      0x21,
    ]);
    console.log(this.blobPath);
    const ref = this.storage.ref(this.blobPath);
    const task = ref.put(file);
  }
}
