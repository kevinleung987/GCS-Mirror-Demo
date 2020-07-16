import { Component, Input, OnChanges, ViewChild, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { ConfigService } from './../../services/config.service';
import { PathService } from './../../services/path.service';
import { ItemDocument, PrefixDocument } from './../../models/document';
import * as md5 from 'blueimp-md5';
import { AngularFireStorage } from '@angular/fire/storage';

@Component({
  selector: 'app-items-table',
  templateUrl: './items-table.component.html',
  styleUrls: ['./items-table.component.css'],
})
export class ItemsTableComponent implements OnInit, OnChanges {
  displayedColumns: string[] = ['id', 'size', 'type', 'updated', 'actions'];
  dataSource: MatTableDataSource<ItemDocument> = new MatTableDataSource();
  items: Subscription;

  @Input() path: string;
  @Input() childRef: string;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
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
    if (this.items) {
      this.items.unsubscribe();
    }
    this.items = this.firestore
      .doc(this.pathService.getFirestorePath(this.path))
      .collection(this.config.items)
      .snapshotChanges()
      .pipe(
        map((snapshot) =>
          snapshot.reduce((result, item) => {
            const data = item.payload.doc.data() as ItemDocument;
            const id = item.payload.doc.id;
            const hash = md5(item.payload.doc.ref.path);
            if (data.deletedTime === null) {
              result.push({ id, ...data, hash });
            }
            return result;
          }, [])
        )
      )
      .subscribe((data) => (this.dataSource.data = data));
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

  deleteFile(id: string): void {
    console.log(this.path + id);
    const ref = this.storage.ref(this.path + id);
    ref.delete();
  }
}
