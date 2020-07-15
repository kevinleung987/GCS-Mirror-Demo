import { Component } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { MatDialog } from '@angular/material/dialog';

import { SettingsComponent } from './components/settings/settings.component';
import { PathService } from './services/path.service';
import { environment } from './../environments/environment';

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
    public pathService: PathService,
    public dialog: MatDialog
  ) {
    this.path = '';
  }

  openDialog(): void {
    this.dialog.open(SettingsComponent, {
      width: '600px',
    });
  }

  openSource(): void {
    window.open(environment.sourceUrl, '_blank');
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
      const newPath = this.path.slice(0, -1).split('/').slice(0, -1).join();
      this.path = newPath.length === 0 ? newPath : newPath + '/';
    } else {
      this.path = this.path + id + '/';
    }
  }
}
