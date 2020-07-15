import { Component, Input, OnChanges, ViewChild, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ConfigService } from './../../services/config.service';
import { PathService } from './../../services/path.service';
import { ItemDocument } from './../../models/document';

@Component({
  selector: 'app-items-table',
  templateUrl: './items-table.component.html',
  styleUrls: ['./items-table.component.css'],
})
export class ItemsTableComponent implements OnInit, OnChanges {
  displayedColumns: string[] = ['id', 'size', 'type', 'updated'];
  dataSource: MatTableDataSource<ItemDocument> = new MatTableDataSource();
  items: Observable<ItemDocument[]>;

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
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'size':
          return parseInt(item.gcsMetadata.size, 10);
        case 'type':
          return item.gcsMetadata.contentType;
        case 'updated':
          return new Date(item.gcsMetadata.updated);
        default:
          return item[property];
      }
    };
    this.dataSource.sort = this.sort;
  }

  ngOnChanges(): void {
    this.items = this.firestore
      .doc(this.pathService.getFirestorePath(this.path))
      .collection(this.config.items)
      .valueChanges({
        idField: 'id',
      })
      .pipe(
        map((result) => result.filter((doc) => doc.deletedTime == null))
      ) as Observable<ItemDocument[]>;
    this.items.subscribe((data) => (this.dataSource.data = data));
  }

  formatBytes(bytes, decimals = 2): string {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}
