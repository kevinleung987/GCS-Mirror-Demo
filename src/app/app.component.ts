import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { firebaseConfig } from './../environments/firebaseConfig';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  items: Observable<any[]>;
  constructor(firestore: AngularFirestore) {
    this.items = firestore
      .collection('gcs-mirror')
      .doc(firebaseConfig.storageBucket)
      .collection('items')
      .valueChanges({
        idField: 'id',
      });
  }
}
