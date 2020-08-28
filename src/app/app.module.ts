import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { environment } from '../environments/environment';
import { AngularMaterialModule } from './modules/angular-material.module';
import { AppComponent } from './app.component';
import { MirrorComponent } from './components/mirror/mirror.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { PathService } from './services/path.service';
import { ConfigService } from './services/config.service';
import { SettingsComponent } from './components/settings/settings.component';
import { InfoComponent } from './components/info/info.component';

@NgModule({
  declarations: [
    AppComponent,
    MirrorComponent,
    NavigationComponent,
    SettingsComponent,
    InfoComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireStorageModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
  ],
  providers: [PathService, ConfigService],
  bootstrap: [AppComponent],
})
export class AppModule {}
