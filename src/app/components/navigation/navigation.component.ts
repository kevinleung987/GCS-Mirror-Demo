import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import * as md5 from 'blueimp-md5';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { ConfigService } from '../../services/config.service';
import { PathService } from '../../services/path.service';
import { PrefixDocument } from './../../models/document';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css'],
})
export class NavigationComponent implements OnInit, OnChanges {
  displayedColumns: string[] = ['id', 'lastEvent', 'actions'];
  dataSource: MatTableDataSource<PrefixDocument> = new MatTableDataSource();
  prefixes: Subscription;

  @Input() path: string;
  @Input() childRef: string;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @Output() pathChange: EventEmitter<string> = new EventEmitter();
  constructor(
    private firestore: AngularFirestore,
    private config: ConfigService,
    private pathService: PathService
  ) {}

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnChanges(): void {
    if (this.prefixes) {
      this.prefixes.unsubscribe();
    }
    this.prefixes = this.firestore
      .doc(this.pathService.getFirestorePath(this.path))
      .collection(this.config.prefixes)
      .snapshotChanges()
      .pipe(
        map((snapshot) =>
          snapshot.reduce(
            (result: any[], item) => {
              const data = item.payload.doc.data() as PrefixDocument;
              const id = item.payload.doc.id;
              const hash = md5(item.payload.doc.ref.path);
              if (data.deletedTime === null) {
                result.push({ id, ...data, hash });
              }
              return result;
            },
            this.path.length === 0 ? [] : [{ id: '../' }]
          )
        )
      )
      .subscribe((data) => (this.dataSource.data = data));
  }

  navigate(id: string): void {
    this.pathChange.emit(id);
  }
}
