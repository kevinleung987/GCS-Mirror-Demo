import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';

import { environment } from './../environments/environment';
import { InfoComponent } from './components/info/info.component';
import { SettingsComponent } from './components/settings/settings.component';
import { PrefixDocument } from './models/document';
import { PathService } from './services/path.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  blobPath = '';
  path = '';

  constructor(
    private storage: AngularFireStorage,
    public pathService: PathService,
    public dialog: MatDialog,
    private firestore: AngularFirestore
  ) {}

  ngOnInit(): void {}

  openInfoDialog(): void {
    this.dialog.open(InfoComponent, {
      width: '60%',
    });
  }

  openSettingsDialog(): void {
    this.dialog.open(SettingsComponent, {
      width: '600px',
    });
  }

  openSource(): void {
    window.open(environment.sourceUrl, '_blank');
  }

  uploadBlob(): void {
    const file = new Uint8Array([0x00]);
    const ref = this.storage.ref(this.path + '/' + this.blobPath);
    ref.put(file);
  }

  handlePathChange(id: string): void {
    // TODO: Turn path into array of strings instead of delimiting with slash
    if (id === '../') {
      const newPath = this.path.slice(0, -1).split('/').slice(0, -1).join('/');
      this.path = newPath.length === 0 ? newPath : newPath + '/';
    } else {
      this.path = this.path + id + '/';
    }
  }
}
