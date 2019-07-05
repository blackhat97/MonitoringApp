import { Storage } from '@ionic/storage';
import { AlertController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class PostApiService {

  url = environment.url;
  TOKEN_NAME = environment.jwt_token;

  public headers: any;

  constructor(
    private http: HttpClient,
    private storage: Storage,
    private alertController: AlertController,

  ) { 
    this.storage.get(this.TOKEN_NAME).then(token => {
      if (token) {
        this.headers = new HttpHeaders()
        .set('Authorization', 'Bearer ' + token);
      }
    });

  }


  editChannelName(id, name) {
    return this.http.put(`${this.url}/channel/name/`+id, name, { headers: this.headers })
    .pipe(
      tap(res => {
        return res;
      }),
      catchError(e => {
        this.showAlert("오류가 생겼습니다.");
        throw new Error(e);
      })
    )
  }

  editSensorName(id, name) {
    return this.http.put(`${this.url}/sensor/name/`+id, name, { headers: this.headers })
    .pipe(
      tap(res => {
        return res;
      }),
      catchError(e => {
        this.showAlert("오류가 생겼습니다.");
        throw new Error(e);
      })
    )
  }

  updateLimits(sensorid, userid, value) {
    return this.http.post(`${this.url}/limits/`+ userid + `/` + sensorid, value, { headers: this.headers })
    .pipe(
      tap(res => {
        return res;
      }),
      catchError(e => {
        this.showAlert("오류가 생겼습니다.");
        throw new Error(e);
      })
    )
  }

  updateMaxLimits(value) {
    return this.http.put(`${this.url}/limits/max`, value, { headers: this.headers })
    .pipe(
      tap(res => {
        return res;
      }),
      catchError(e => {
        this.showAlert("오류가 생겼습니다.");
        throw new Error(e);
      })
    )
  }

  updateMinLimits(value) {
    return this.http.put(`${this.url}/limits/min`, value, { headers: this.headers })
    .pipe(
      tap(res => {
        return res;
      }),
      catchError(e => {
        this.showAlert("오류가 생겼습니다.");
        throw new Error(e);
      })
    )
  }

  booleanLimits(value) {
    return this.http.post(`${this.url}/limits/bool`, value, { headers: this.headers })
    .pipe(
      tap(res => {
        return res;
      }),
      catchError(e => {
        this.showAlert("오류가 생겼습니다.");
        throw new Error(e);
      })
    )
  }

  updateSchedule(id, value) {
    return this.http.put(`${this.url}/schedule/`+id, value, { headers: this.headers })
    .pipe(
      tap(res => {
        return res;
      }),
      catchError(e => {
        this.showAlert("오류가 생겼습니다.");
        throw new Error(e);
      })
    )
  }

  updateAlarms(id, value) {
    return this.http.put(`${this.url}/push-setting/`+id, value, { headers: this.headers })
    .pipe(
      tap(res => {
        return res;
      }),
      catchError(e => {
        this.showAlert("오류가 생겼습니다.");
        throw new Error(e);
      })
    )
  }


  showAlert(msg) {
    let alert = this.alertController.create({
      message: msg,
      header: '알림',
      buttons: ['OK']
    });
    alert.then(alert => alert.present());
  }

  

}
