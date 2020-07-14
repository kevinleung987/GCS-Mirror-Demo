import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxJsonViewerModule } from 'ngx-json-viewer';

import { environment } from '../environments/environment';
import { AngularMaterialModule } from './angular-material.module';
import { AppComponent } from './app.component';
import { ItemsTableComponent } from './items-table/items-table.component';
import { NavigationComponent } from './navigation/navigation.component';

@NgModule({
  declarations: [AppComponent, ItemsTableComponent, NavigationComponent],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireStorageModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    NgxJsonViewerModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
