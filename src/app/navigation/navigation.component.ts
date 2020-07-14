import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { firebaseConfig } from 'src/environments/firebaseConfig';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css'],
})
export class NavigationComponent implements OnInit {
  prefixes: Observable<any[]>;
  constructor(private firestore: AngularFirestore) {
    this.prefixes = this.firestore
      .collection('gcs-mirror')
      .doc(firebaseConfig.storageBucket)
      .collection('prefixes')
      .valueChanges({
        idField: 'id',
      })
      .pipe(map((result) => result.filter((doc) => doc.deletedTime == null)));
  }

  ngOnInit(): void {}
}
