import { Component, OnInit } from '@angular/core';
import { ConfigService } from './../../services/config.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit {
  settings: { [key: string]: string } = {};
  constructor(public config: ConfigService) {}

  ngOnInit(): void {
    this.settings.firestoreRoot = this.config.firestoreRoot;
    this.settings.items = this.config.items;
    this.settings.prefixes = this.config.prefixes;
  }

  handleSave(): void {
    Object.entries(this.settings).forEach(([key, value]) => {
      this.config.setKey({ key, value });
    });
    location.reload();
  }

  handleReset(): void {
    this.config.setDefaults();
    location.reload();
  }
}
