import { Component } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  blobPath = '';
  constructor(private storage: AngularFireStorage) {}

  uploadBlob(): void {
    const file = new Uint8Array([0x00, 0x00]);
    console.log(this.blobPath);
    const ref = this.storage.ref(this.blobPath);
    ref.put(file);
  }
}
