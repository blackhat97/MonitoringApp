import { GetApiService } from './../shared/services/get-api.service';
import { FcmApiService } from './../shared/services/fcm-api.service';
import { MenuController, AlertController, NavController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { FCM } from '@ionic-native/fcm/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { environment } from '../../environments/environment.prod';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {
  
  USERNAME = environment.username;
  COMPANY_ID = environment.company_id;
  user: string;
  company: string = "";

  constructor(
    public menu: MenuController,
    private storage: Storage,
    private fcm: FCM,
    private fcmapi: FcmApiService,
    private getapi: GetApiService,
    public alertCtrl: AlertController,
    private socialSharing: SocialSharing,
    public inAppBrowser: InAppBrowser,
    public navCtrl: NavController,

  ) {
   }

  ionViewDidEnter(){
   
    this.storage.ready().then(() => {
    
      this.storage.get(this.USERNAME).then(username => {
        this.user = username;
        this.fcm.getToken().then(token => {
          if(token) {
            let value = {"username": username, "token": token};
            this.fcmapi.updateToken(value).subscribe();
          }
        });
      });

      this.storage.get(this.COMPANY_ID).then(companyId => {
        this.getapi.getCompany(companyId).subscribe((res: any) => { 
          this.company = res[0].company;
        });
      });
      
    });
  }

  openEmail() {
    
    this.socialSharing.shareViaEmail('문의사항을 기재해주세요.', '문의사항', ['daeyoon@dymeter.com']).then(() => {
      console.log("write email");
    }).catch((e) => {
      // Error!
    });
  }

  openUrl() {
    this.inAppBrowser.create(
      `http://dymeter.com/ko/`,
      '_blank'
    );
  }

  showAlert(msg) {
    let alert = this.alertCtrl.create({
      message: msg,
      header: '알림',
      buttons: ['OK']
    });
    alert.then(alert => alert.present());
  }

  goToProfile() {
    this.navCtrl.navigateForward('/profile');
  }

}
