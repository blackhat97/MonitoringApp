import { GetApiService } from './../../shared/services/get-api.service';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Component, OnInit } from '@angular/core';
import { _ } from 'underscore';
import { environment } from '../../../environments/environment.prod';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
})
export class NotificationPage implements OnInit {

  COMPANY_ID = environment.company_id;
  USER_ID = environment.user_id;

  MSG_OK = environment.msg_ok;
  MSG_NETWORK_ERROR = environment.msg_network_error;
  MSG_CORRECTION = environment.msg_correction;
  MSG_REPLACE = environment.msg_replace;
  MSG_TROUBLE = environment.msg_trouble;
  MSG_CLEAN = environment.msg_clean;
  MSG_RANGE_OFF = environment.msg_range_off;
  
  groups: any;
  objectKeys = Object.keys;

  queryText = '';
  //buttons = Array(10).fill(false);


  constructor(
    private getapi: GetApiService,
    private storage: Storage,
    public alertCtrl: AlertController,
    private toastController: ToastController,
    public loadingController: LoadingController,

  ) {
    storage.get(this.COMPANY_ID).then(companyId => {
      storage.get(this.USER_ID).then(userId => {
        this.getapi.getNotification(companyId, userId).subscribe((res: any) => { 
          this.groups = res;
        });
      });
    });
   }

  ngOnInit() {

  }

  eventPrompt(slidingItem: HTMLIonItemSlidingElement) {
    slidingItem.close();

  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      duration: 500,
      spinner: 'bubbles',
      translucent: true,
      cssClass: 'custom-class custom-loading'
    });
    return await loading.present();
  }


  async presentToast(msg) {
    const toast = await this.toastController.create({
        message: msg,
        position: 'bottom',
        duration: 500
    });
    toast.present();
  }

  loadData(event) {
    setTimeout(() => {
      console.log('Done');
      event.target.complete();

    }, 1000);
  }


  updateList(ev) {
    let queryText = ev.target.value;
    
    queryText = queryText.toLowerCase().replace(/,|\.|-/g, ' ');
    const queryWords = queryText.split(' ').filter(w => !!w.trim().length);

    this.groups.forEach((session: any) => {
      this.filterSession(session, queryWords);
    });
  }

  filterSession(session, queryWords) {
    let matchesQueryText = false;
    const tttt = [this.MSG_NETWORK_ERROR, this.MSG_CORRECTION, this.MSG_REPLACE, this.MSG_TROUBLE, this.MSG_CLEAN, this.MSG_RANGE_OFF];

    if (queryWords.length) {
      queryWords.forEach((queryWord: string) => {
        if (session.name_tag.toLowerCase().indexOf(queryWord) > -1) {
          matchesQueryText = true;
        }
      });
    } else {
      matchesQueryText = true;
    }
    session.hide = !matchesQueryText;

  }


}
