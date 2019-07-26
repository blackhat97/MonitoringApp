import { Component, QueryList, ViewChildren, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { Platform, AlertController, IonRouterOutlet, ToastController, Config } from '@ionic/angular';
import { AuthenticationService } from './shared/services/authentication.service';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from './shared/storage/storage.service';
import { NetworkService, ConnectionStatus } from './shared/services/network.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {

  @ViewChildren(IonRouterOutlet) routerOutlets: QueryList<IonRouterOutlet>;
  @ViewChild(IonRouterOutlet) routerOutlet: IonRouterOutlet;

  lastBack: number;
  allowClose: boolean;

  constructor(
    private platform: Platform,
    private router: Router,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private authService: AuthenticationService,
    public alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private translate: TranslateService,
    private config: Config,
    private storage: StorageService,
    private networkService: NetworkService 
  ) {

    this.initTranslate();
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.checkToken();

      if (this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Offline) {
        this.showAlert('네트워크 연결 확인 바랍니다.');
        setInterval(() => {
          navigator['app'].exitApp();
        }, 2000);
      }

      /*
      this.disconnected = this.network.onDisconnect().subscribe(() => {
        this.showAlert('네트워크 연결 확인 바랍니다.');
        setInterval(() => {
          navigator['app'].exitApp();
        }, 2000);
      });
      */
    });
  }

  initTranslate() {
    this.translate.setDefaultLang('ko');
    this.storage.getLang().then(lang => {
      if (!lang && this.translate.getBrowserLang() !== undefined) {
        this.translate.use(this.translate.getBrowserLang());
      } else {
        this.translate.use(lang || 'ko'); // Establezca su idioma aquí
      }
      this.translate.get(['BACK_BUTTON_TEXT']).subscribe(values => {
        this.backButtonEvent();
        this.config.set('backButtonText', values.BACK_BUTTON_TEXT);
      });
    });
  }

  checkToken() {
    this.authService.checkToken();
  }

  backButtonEvent() {
    /*
    const closeDelay = 2000;
    const spamDelay = 500;
    this.platform.backButton.subscribe(async () => {
      this.routerOutlets.forEach((outlet: IonRouterOutlet) => {
        //if (this.router.url === '/home' || this.router.url === '/login' || this.router.url === '/') {
        if (this.router.isActive('/home', true) || this.router.isActive('/login', true) || this.router.isActive('/', true)) {
          if (outlet && outlet.canGoBack()) {
            outlet.pop();
          } else if(Date.now() - this.lastBack > spamDelay && !this.allowClose) {
            this.allowClose = true;
            this.presentToast('뒤로버튼 한번 더 누르시면 종료됩니다.', closeDelay);
            
          } else if(Date.now() - this.lastBack < closeDelay && this.allowClose) {
            navigator['app'].exitApp();
          }  
          this.lastBack = Date.now();
        }

      });
    });
    */

    this.platform.backButton.subscribeWithPriority(0, () => {
        if (this.router.url === '/home' || this.router.url === '/login') {
          navigator['app'].exitApp();
        } else if (this.routerOutlet && this.routerOutlet.canGoBack()) {
          this.routerOutlet.pop();
        } else {
          this.presentToast(this.router.url, 2000);
        }
    });
    
  }

  async presentToast(msg, closeDelay) {
    const toast = await this.toastCtrl.create({
        message: msg,
        position: 'bottom',
        duration: closeDelay
    });
    toast.onDidDismiss().then(() => {
			this.allowClose = false;
    });
    toast.present();
  }

  showAlert(msg) {
    let alert = this.alertCtrl.create({
      message: msg,
      header: '알림',
      buttons: ['OK']
    });
    alert.then(alert => alert.present());
  }
  
}
