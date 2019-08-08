import { GetApiService } from './../../shared/services/get-api.service';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { AuthenticationService } from './../../shared/services/authentication.service';
import { Component } from '@angular/core';
import { ToastController, AlertController, NavController, Platform } from '@ionic/angular';
import { environment } from '../../../environments/environment.prod';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { AppUpdate } from '@ionic-native/app-update/ngx';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss']
})

export class ProfilePage {

  USERNAME = environment.username;
  USERID = environment.user_id;
  profiles : any;

  VersionNumber:string;

  constructor(
    private authService: AuthenticationService, 
    private toastController: ToastController,
    public alertCtrl: AlertController,
    public getapi: GetApiService,
    private storage: Storage,
    public router: Router,
    public navCtrl: NavController,
    private appVersion: AppVersion,
    public plt: Platform,
    private appUpdate: AppUpdate
    ) { 
      this.getProfile();

      if(this.plt.is('android')) {
        this.appVersion.getVersionNumber().then(value => {
          this.VersionNumber = `v${value}`;
        }).catch(err => {
          console.log(err);
        });
      }
      
    }

  updateApp() {
    const updateUrl = 'http://download.dymeter.com/download/update.xml';
    this.appUpdate.checkAppUpdate(updateUrl).then(() => { console.log('Update available') });
  }

  onLoggedout() {
    this.authService.logout();
  }

  getProfile() {
    this.storage.get(this.USERNAME).then(username => {
      this.getapi.getProfile(username).subscribe((res) => {
        this.profiles = res;
      });
    });
  }

  async presentToast(text) {
    const toast = await this.toastController.create({
        message: text,
        position: 'bottom',
        duration: 2500,
        color: 'primary',
    });
    toast.present();
  }

  async changePassword() {
    const alert = await this.alertCtrl.create({
      header: '비밀번호 변경',
      inputs: [
        {
          type: 'password',
          name: 'oldpass',
          placeholder: '현재 비밀번호'
        },
        {
          type: 'password',
          name: 'newpass',
          placeholder: '새로운 비밀번호'
        },
        {
          type: 'password',
          name: 'newpasschk',
          placeholder: '비밀번호 재입력'
        }
      ],
      buttons: [
        {
          text: '취소',
          role: 'cancel'
        },
        {
          text: '확인',
          role: 'submit',
          handler: data => {
            
            if(data.newpass == "" || data.oldpass == "" || data.newpasschk == "") {
              this.presentToast("모두입력 바랍니다.");
              return false;
            }
            if(data.newpass != data.newpasschk) {
              this.presentToast("새로운 비밀번호가 일치하지 않습니다.");
              return false;
            } else {
              let value = { "oldpass": data.oldpass, "newpass": data.newpass };
              
              this.storage.get(this.USERID).then(id => {
                this.authService.updatePass(id, value).subscribe( (res: any) => {  
                  this.presentToast(res.message);
                  
                });
              });
            }
            
          }
        }
      ],
    });
    await alert.present();
  }

  goBack() {
    this.navCtrl.navigateRoot('/home');
  }


}