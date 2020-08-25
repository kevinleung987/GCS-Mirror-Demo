import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  AngularFirestore,
  CollectionReference,
  QueryFn,
} from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import * as md5 from 'blueimp-md5';
import { Observable, Subscription } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { operatorOptions, queryableFields, inputTypeOptions } from './../../constants';
import { ItemDocument, PrefixDocument } from './../../models/document';
import { ConfigService } from './../../services/config.service';
import { PathService } from './../../services/path.service';

interface IFilter {
  enabled: boolean;
  field: string;
  operator: firebase.firestore.WhereFilterOp;
  inputType: 'string' | 'number' | 'date';
  value: any;
}

type TableData = ItemDocument & { hash: string; state: string };

@Component({
  selector: 'app-mirror',
  templateUrl: './mirror.component.html',
  styleUrls: ['./mirror.component.css'],
})
export class MirrorComponent implements OnInit, OnChanges {
  displayedColumns: string[] = ['id', 'size', 'type', 'updated', 'actions'];
  limits = [
    { value: 100, viewValue: 100 },
    { value: 50, viewValue: 50 },
    { value: 25, viewValue: 25 },
    { value: 10, viewValue: 10 },
    { value: 5, viewValue: 5 },
    { value: 1, viewValue: 1 },
  ];
  queryableFields = [[null, 'None'], ...Object.entries(queryableFields)];
  operators = [[null, 'None'], ...Object.entries(operatorOptions)];
  inputTypes = [[null, 'None'], ...Object.entries(inputTypeOptions)];

  dataSource: MatTableDataSource<TableData> = new MatTableDataSource();
  items: Subscription;
  fullData: TableData[] = [];
  parentPrefix: Subscription;
  childRef: string;

  fileChosen: File;
  filePath = '';
  uploadProgress = null;

  options = {
    showChildRef: true,
    limit: 100,
    orderBy: this.queryableFields[0][0],
    filterBy: this.queryableFields[0][0],
    order: 'asc' as firebase.firestore.OrderByDirection,
  };
  filters: IFilter[] = [];
  filtersDirty = false;

  @Input() path: string[];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Output() pathChange: EventEmitter<string> = new EventEmitter();
  constructor(
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private config: ConfigService,
    private pathService: PathService,
    private snackBar: MatSnackBar
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
    this.dataSource.data = [];
    this.fullData = [];
    this.items = this.firestore
      .doc(this.pathService.getFirestorePath(this.path))
      .collection(this.config.items, this.getQueryFn())
      .stateChanges()
      .subscribe(
        (snapshot) => {
          snapshot.forEach((item) => {
            const stateType = item.payload.type;
            const id = item.payload.doc.id;
            if (stateType == 'added') {
              const data = item.payload.doc.data() as ItemDocument;
              const hash = this.options.showChildRef
                ? md5(item.payload.doc.ref.path)
                : null;
              const obj: TableData = { id, ...data, hash, state: stateType };
              this.fullData.push(obj);
            } else if (stateType == 'modified' || stateType == 'removed') {
              const item = this.fullData.find((d) => d.id === id);
              if (item) {
                item.state = stateType;
              }
            }
          });
          this.updateData();
        },
        (error) => {
          if (error.code === 'failed-precondition') {
            const parts = error.toString().split(' ');
            const url = parts[parts.length - 1];
            if (url.includes('https://')) {
              return this.snackBar
                .open(
                  'This query requires an index. Click here to create it:',
                  'Open',
                  { duration: 10000 }
                )
                .onAction()
                .subscribe(() => window.open(url, '_blank'));
            }
          }
          console.error(error);
          this.snackBar.open(error.toString(), null, { duration: 10000 });
        }
      );
  }

  updateData(): void {
    const newData = this.fullData;
    newData.forEach((data) => {
      setTimeout(() => {
        if (data.state === 'removed') {
          const itemIdx = this.dataSource.data.findIndex((d) => d.id === data.id);
          this.dataSource.data.splice(itemIdx, 1);
          this.dataSource.data = this.dataSource.data;
        } else {
          data.state = 'old';
        }
      }, 1000);
    });
    this.dataSource.data = newData;
  }

  getQueryFn(): QueryFn {
    return (ref) => {
      let ret: CollectionReference | firebase.firestore.Query = ref;
      if (this.options.orderBy != null) {
        ret = ret.orderBy(
          'gcsMetadata.' + this.options.orderBy,
          this.options.order
        );
      }
      this.filters.forEach((filter) => {
        if (this.isValidFilter(filter)) {
          try {
            ret = ret.where(
              'gcsMetadata.' + filter.field,
              filter.operator,
              this.getFilterValue(filter)
            );
          } catch (e) {
            this.snackBar.open(e.toString(), null, { duration: 10000 });
          }
        }
      });
      return ret.limit(this.options.limit);
    };
  }

  getFilterValue(filter: IFilter): any {
    let value = filter.value;
    if (filter.inputType == 'number') {
      value = parseFloat(value);
    } else if (filter.inputType == 'string') {
      value = new String(value);
    } else if (filter.inputType == 'date') {
      value = new Date(value);
    }
    return value;
  }

  isValidFilter(filter: IFilter): boolean {
    if (filter.enabled === false) {
      return false;
    }
    if (filter.field == null || filter.operator == null) {
      return false;
    }
    return true;
  }

  updateChildRef(): void {
    if (this.parentPrefix) {
      this.parentPrefix.unsubscribe();
    }
    this.parentPrefix = (this.firestore
      .doc(this.pathService.getFirestorePath(this.path))
      .valueChanges() as Observable<PrefixDocument>).subscribe(
      (data) => (this.childRef = data?.childRef)
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
    const ref = this.storage.ref(this.path.join('/') + id);
    ref.delete();
  }

  downloadFile(id: string): void {
    const ref = this.storage.ref(this.path.join('/') + id);
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

  addFilter(): void {
    this.filters.push({ enabled: true, field: null, operator: null, inputType: null, value: null });
  }

  checkDirty(index: number): void {
    if (this.isValidFilter(this.filters[index])) {
      this.filtersDirty = true;
    }
  }
}
