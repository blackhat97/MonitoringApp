import { Injectable } from '@angular/core';
import { MenuController, ModalController, NavController, ToastController, AlertController, LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class SupportService {

  constructor(
      public navCtrl:NavController,
      private toastController: ToastController,
      public alertCtrl: AlertController,
      public loadingController: LoadingController,

    ) { }
  

  async presentToast(msg) {
    const toast = await this.toastController.create({
        message: msg,
        position: 'bottom',
        duration: 2500
    });
    toast.present();
  }

  showAlert(msg) {
    let alert = this.alertCtrl.create({
      message: msg,
      header: '알림',
      buttons: ['확인']
    });
    alert.then(alert => alert.present());
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      duration: 500,
      spinner: 'dots',
      translucent: true,
      cssClass: 'custom-class custom-loading'
    });
    return await loading.present();
  }

}
