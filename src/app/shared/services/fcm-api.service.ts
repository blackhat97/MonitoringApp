import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class FcmApiService {

  url = environment.url;
  TOKEN_NAME = environment.jwt_token;

  public headers: any;

  constructor(
    private http: HttpClient,
    private storage: Storage,

  ) {
    this.storage.get(this.TOKEN_NAME).then(token => {
      if (token) {
        this.headers = new HttpHeaders()
        .set('Authorization', 'Bearer ' + token);
      }
    });
   }

  updateToken(value) {
    return this.http.post(`${this.url}/fcm`, value, { headers: this.headers })
    .pipe(
      tap(res => {
        return res;
      }),
      catchError(e => {
        throw new Error(e);
      })
    )
  }

}
