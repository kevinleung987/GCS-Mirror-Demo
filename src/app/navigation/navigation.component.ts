import { Component, Input, OnChanges } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ConfigService } from '../services/config.service';
import { PathService } from './../services/path.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css'],
})
export class NavigationComponent implements OnChanges {
  prefixes: Observable<any[]>;

  @Input() path: string;
  constructor(
    private firestore: AngularFirestore,
    private config: ConfigService,
    private pathService: PathService
  ) {}

  ngOnChanges(): void {
    this.prefixes = this.firestore
      .doc(this.pathService.getFirestorePath(this.path))
      .collection(this.config.prefixes)
      .valueChanges({
        idField: 'id',
      })
      .pipe(map((result) => result.filter((doc) => doc.deletedTime == null)));
  }
}
