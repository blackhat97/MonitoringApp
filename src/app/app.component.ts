import { Component, OnInit, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { Platform, AlertController, IonRouterOutlet, ToastController, Config } from '@ionic/angular';
import { AuthenticationService } from './shared/services/authentication.service';
import { Network } from '@ionic-native/network/ngx';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from './shared/storage/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {

  @ViewChildren(IonRouterOutlet) routerOutlets: QueryList<IonRouterOutlet>;
  lastBack: number;
  allowClose: boolean;


  constructor(
    private platform: Platform,
    private router: Router,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private authService: AuthenticationService,
    public alertCtrl: AlertController,
    private network: Network,
    private toastCtrl: ToastController,
    private translate: TranslateService,
    private config: Config,
    private storage: StorageService,
  ) {
    this.initTranslate();
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.checkToken();
    });

    this.network.onDisconnect().subscribe(() => {
      this.networkAlert();
      setInterval(() => {
        navigator['app'].exitApp();
      }, 2000);
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
      //this.backButtonEvent();
    });
  }

  async displayNetworkUpdate(connectionState: string){
    let networkType = this.network.type;
    const toast = await this.toastCtrl.create({
      message: `You are now ${connectionState} via ${networkType}`,
      position: 'bottom',
      duration: 2000
    });
    toast.present();
  }

  async networkAlert() {
    const alert = await this.alertCtrl.create({
      header: '알림',
      message: '네트워크 연결 확인 바랍니다.',
      buttons: ['확인']
    });
    await alert.present();
  }

  checkToken() {
    this.authService.checkToken();
  }

  // active hardware back button
  backButtonEvent() {
    
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
  
}
