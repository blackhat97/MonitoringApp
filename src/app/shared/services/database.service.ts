import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { BehaviorSubject, Observable } from 'rxjs';
import { Platform } from '@ionic/angular';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { Storage } from '@ionic/storage';


@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private database: SQLiteObject;
  private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  settings = new BehaviorSubject([]);
  
  constructor(
    private plt: Platform,
    private sqlitePorter: SQLitePorter,
    private sqlite: SQLite,
    private storage: Storage,
    private http: HttpClient
  ) { 
    this.plt.ready().then(() => {
      this.sqlite.create({
        name: 'waterapp.db',
        location: 'default'
      })
      .then((db: SQLiteObject) => {
          this.database = db;
          this.storage.get('database_filled').then(val => {
            if (val) {
              this.dbReady.next(true);
            } else {
              this.seedDatabase();
            }
          });
      });
    });
  }

  seedDatabase() {
    this.http.get('assets/data/seed.sql', { responseType: 'text'})
    .subscribe(sql => {
      this.sqlitePorter.importSqlToDb(this.database, sql)
        .then(_ => {
          this.loadSettings();
          this.dbReady.next(true);
          this.storage.set('database_filled', true);
        })
        .catch(e => console.error(e));
    });
  }

  getDatabaseState() {
    return this.dbReady.asObservable();
  }
 
  getSettings(): Observable<any[]> {
    return this.settings.asObservable();
  }

  loadSettings() {
    let query = 'SELECT * FROM settings;';
    return this.database.executeSql(query, []).then(data => {
      let settings = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          settings.push({ 
            tempSign: data.rows.item(i).tempSign,
            tempUnit: data.rows.item(i).tempUnit,
            storeInt: data.rows.item(i).storeInt,
            storeTerm: data.rows.item(i).storeTerm
           });
        }
      }
      this.settings.next(settings);
    });
  }

  addSettings(name) {
    let data = [name];
    return this.database.executeSql('INSERT INTO settings (sensorId) VALUES (?)', data).then(data => {
      this.loadSettings();
    });
  }

  updateSettings(name) {
    let data = [name];
    return this.database.executeSql('UPDATE settings SET tempSign = ?', data).then(data => {
    this.loadSettings();
    });
  }


}
