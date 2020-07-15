import { Component } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';

import { ConfigService } from './services/config.service';
import { PathService } from './services/path.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  blobPath = '';
  path: string;
  constructor(
    private storage: AngularFireStorage,
    private config: ConfigService,
    public pathService: PathService
  ) {
    this.path = '';
  }

  uploadBlob(): void {
    const file = new Uint8Array([0x00, 0x00]);
    console.log(this.blobPath);
    const ref = this.storage.ref(this.path + '/' + this.blobPath);
    ref.put(file);
  }

  handlePathChange(id: string): void {
    // TODO: Turn path into array of strings instead of delimiting with slash
    if (id === '../') {
      const newPath = this.path.slice(0, -1).split('/').slice(0, -1).join()
      this.path = newPath.length === 0 ? newPath : newPath + '/';
    } else {
      this.path = this.path + id + '/';
    }
  }
}
