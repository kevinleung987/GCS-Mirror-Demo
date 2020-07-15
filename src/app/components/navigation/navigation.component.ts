import {
  Component,
  Input,
  OnChanges,
  ViewChild,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
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
  displayedColumns: string[] = ['id', 'lastEvent', 'actions'];
  dataSource: MatTableDataSource<PrefixDocument> = new MatTableDataSource();
  prefixes: Observable<PrefixDocument[]>;

  @Input() path: string;
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
    this.prefixes = this.firestore
      .doc(this.pathService.getFirestorePath(this.path))
      .collection(this.config.prefixes)
      .valueChanges({
        idField: 'id',
      })
      .pipe(
        map((result) => {
          // Filter for Tombstones.
          const filtered = result.filter((doc) => doc.deletedTime == null);
          if (this.path.length === 0) {
            return filtered;
          }
          return [{ id: '../' }].concat(filtered);
        })
      ) as Observable<PrefixDocument[]>;
    this.prefixes.subscribe((data) => (this.dataSource.data = data));
  }

  navigate(id: string): void {
    this.pathChange.emit(id);
  }
}
