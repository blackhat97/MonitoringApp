import { HttpClient, HttpParams } from '@angular/common/http';
import { AlertController, NavController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import {JwtHelperService} from "@auth0/angular-jwt";
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment.prod';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  url = environment.url;

  authenticationState = new BehaviorSubject(false);

  jwtHelper = new JwtHelperService();
  USER_NAME = environment.username;
  TOKEN_NAME = environment.jwt_token;
  COMPANY_ID = environment.company_id;
  USER_ID = environment.user_id;


  constructor(
    private http: HttpClient, 
    private storage: Storage, 
    private alertController: AlertController,
    private router: Router,
    private navCtrl: NavController,

    ) { }


  checkToken() {
    this.storage.ready().then(() => {
      this.storage.get(this.TOKEN_NAME).then(token => {
        if (token) {
          this.authenticationState.next(true);
        }
      });
    });
  }

  
  signup(crendentials) {
    return this.http.post(`${this.url}/auth/signup`, crendentials).pipe(
      tap((res: any) => {
        if(!res.success) {
          this.showAlert(res.message);
          return false;
        }
        this.showAlert("회원가입 성공");
        this.router.navigate(['/login']);
      }),
      catchError(e => {

        this.showAlert("서버에 문제가 생겼습니다.");
        throw new Error(e);
      })
    );
  }

  login(credentials) {
    return this.http.post(`${this.url}/auth/login`, credentials)
    .pipe(
      tap(res => {
        this.authSuccess(res['token']);
        this.storage.set(this.COMPANY_ID, res['company_id']);
        this.storage.set(this.USER_ID, res['user_id']);
        
        this.authenticationState.next(true);
        //this.router.navigate(['/home']);
        this.navCtrl.navigateRoot('/home');

      }),
      catchError(e => {
        this.showAlert(e.error.message);
        throw new Error(e);
      })
    )
  }

  logout(): void {
    this.storage.clear();
    this.storage.remove(this.TOKEN_NAME).then(() => {
      this.authenticationState.next(false);
      //this.router.navigateByUrl('/login');
      this.navCtrl.navigateRoot('/login');
    });
  }

  forgot(email) {
    return this.http.post(`${this.url}/auth/forgot`, email)
    .pipe(
      tap(res => {
        this.router.navigate(['/login']);
        //this.navCtrl.navigateRoot('/login');
      }),
      catchError(e => {
        this.showAlert("오류가 생겼습니다.");
        throw new Error(e);
      })
    )
  }

  reset(token, value) {
    return this.http.post(`${this.url}/auth/reset/${token}`, value)
    .pipe(
      tap(res => {
        this.showAlert("비밀번호를 재설정 했습니다.");
        this.router.navigate(['/login']);
        //this.navCtrl.navigateRoot('/login');

      }),
      catchError(e => {
        console.log(e);
        this.showAlert("오류가 생겼습니다.");
        throw new Error(e);
      })
    )
  }

  updatePass(id, value) {
    return this.http.put(`${this.url}/auth/password/`+id, value)
    .pipe(
      tap(res => {
        console.log(res);
      }),
      catchError(e => {
        this.showAlert("오류가 생겼습니다.");
        throw new Error(e);
      })
    )
  }

  // 토큰 유효성 검증
  isAuthenticated(): boolean {
    if(!this.authenticationState.value) {
      this.router.navigate(['login']);
      return false;
    }
    return true;
  }

  showAlert(msg) {
    let alert = this.alertController.create({
      message: msg,
      header: '알림',
      buttons: ['OK']
    });
    alert.then(alert => alert.present());
  }

  authSuccess(token: string): void {
    this.storage.set(this.TOKEN_NAME, token);
    const user = this.jwtHelper.decodeToken(token).id;
    this.storage.set(this.USER_NAME, user);
  }


}
