import {
  Component,
  Input,
  OnChanges,
  OnInit,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import { AngularFirestore, QueryFn } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import * as md5 from 'blueimp-md5';
import { Subscription, Observable } from 'rxjs';
import { map, finalize } from 'rxjs/operators';

import { ItemDocument, PrefixDocument } from './../../models/document';
import { ConfigService } from './../../services/config.service';
import { PathService } from './../../services/path.service';

@Component({
  selector: 'app-mirror',
  templateUrl: './mirror.component.html',
  styleUrls: ['./mirror.component.css'],
})
export class MirrorComponent implements OnInit, OnChanges {
  displayedColumns: string[] = ['id', 'size', 'type', 'updated', 'actions'];
  dataSource: MatTableDataSource<ItemDocument> = new MatTableDataSource();
  items: Subscription;
  parentPrefix: Subscription;
  childRef: string;

  fileChosen: File;
  filePath = '';
  uploadProgress = null;

  options = {
    showTombstones: false,
    showChildRef: true,
  };

  @Input() path: string;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Output() pathChange: EventEmitter<string> = new EventEmitter();
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
    this.updateChildRef();
    this.updateSubscription();
  }

  updateSubscription(): void {
    if (this.items) {
      this.items.unsubscribe();
    }
    this.items = this.firestore
      .doc(this.pathService.getFirestorePath(this.path))
      .collection(this.config.items, this.getQueryFn())
      .snapshotChanges()
      .pipe(
        map((snapshot) =>
          snapshot.reduce((result, item) => {
            const data = item.payload.doc.data() as ItemDocument;
            const id = item.payload.doc.id;
            const hash = this.options.showChildRef
              ? md5(item.payload.doc.ref.path)
              : null;
            // console.log(item.type, item.payload.doc.id);
            const obj = { id, ...data, hash };
            // setTimeout(() => {
            //   obj.id = 'test'
            //   console.log(obj);
            // }, 3000);
            result.push(obj);
            return result;
          }, [])
        )
      )
      .subscribe((data) => (this.dataSource.data = data));
  }

  getQueryFn(): QueryFn {
    if (!this.options.showTombstones) {
      return (ref) => ref.where('deletedTime', '==', null);
    }
    return (ref) => ref;
  }

  updateChildRef(): void {
    if (this.parentPrefix) {
      this.parentPrefix.unsubscribe();
    }
    this.parentPrefix = (this.firestore
      .doc(this.pathService.getFirestorePath(this.path))
      .valueChanges() as Observable<PrefixDocument>).subscribe(
      (data) => (this.childRef = data.childRef)
    );
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
    // TODO: Add confirmation before deleting
    console.log(this.path + id);
    const ref = this.storage.ref(this.path + id);
    ref.delete();
  }

  downloadFile(id: string): void {
    const ref = this.storage.ref(this.path + id);
    ref.getDownloadURL().subscribe((url) => window.open(url, '_blank'));
  }

  navigate(id: string): void {
    this.pathChange.emit(id);
  }

  onFileSelected(file: File[]): void {
    this.fileChosen = file[0];
    this.filePath = this.fileChosen.name;
  }

  uploadFile(): void {
    const task = this.storage.upload(this.filePath, this.fileChosen);
    task
      .percentageChanges()
      .subscribe((percent) => (this.uploadProgress = percent));
    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          setTimeout(() => {
            this.uploadProgress = null;
            this.filePath = '';
          }, 1000);
        })
      )
      .subscribe();
  }
}
