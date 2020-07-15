import { Component, Input, OnChanges, ViewChild, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ConfigService } from '../../services/config.service';
import { PathService } from '../../services/path.service';
import { PrefixDocument } from './../../models/document';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css'],
})
export class NavigationComponent implements OnInit, OnChanges {
  dataSource: MatTableDataSource<PrefixDocument> = new MatTableDataSource();
  prefixes: Observable<PrefixDocument[]>;

  @Input() path: string;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
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
    this.prefixes = this.firestore
      .doc(this.pathService.getFirestorePath(this.path))
      .collection(this.config.prefixes)
      .valueChanges({
        idField: 'id',
      })
      .pipe(
        map((result) => result.filter((doc) => doc.deletedTime == null))
      ) as Observable<PrefixDocument[]>;
    this.prefixes.subscribe((data) => (this.dataSource.data = data));
  }
}
