import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { MatDialog } from '@angular/material/dialog';

import { environment } from './../environments/environment';
import { InfoComponent } from './components/info/info.component';
import { SettingsComponent } from './components/settings/settings.component';
import { PathService } from './services/path.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  blobPath = '';
  path: string[] = [];

  constructor(
    private storage: AngularFireStorage,
    public pathService: PathService,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.path = window.location.pathname.split('/').filter((a) => a.length > 0)
  }

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
    if (id === '../') {
      this.path.pop();
      this.path = JSON.parse(JSON.stringify(this.path))
    } else {
      this.path = this.path.concat([id]);
    }
    window.history.pushState(null, null, this.path.join('/'));
  }
}
