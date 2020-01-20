import { Component, AfterViewInit } from '@angular/core';
import { AlertController, ToastController, LoadingController, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { _ } from 'underscore';
import { environment } from '../../../../environments/environment.prod';
import { GetApiService } from '../../../shared/services/get-api.service';

@Component({
  selector: 'app-noti-modal',
  templateUrl: './noti-modal.component.html',
  styleUrls: ['./noti-modal.component.scss']
})
export class NotiModalComponent implements AfterViewInit {

  COMPANY_ID = environment.company_id;
  USER_ID = environment.user_id;

  MSG_OK = environment.msg_ok;
  MSG_NETWORK_ERROR = environment.msg_network_error;
  MSG_CORRECTION = environment.msg_correction;
  MSG_REPLACE = environment.msg_replace;
  MSG_TROUBLE = environment.msg_trouble;
  MSG_CLEAN = environment.msg_clean;
  MSG_RANGE_OFF = environment.msg_range_off;
  
  ACTIONS = environment.actions;

  groups: any;
  objectKeys = Object.keys;

  queryText = '';

  constructor(
    private getapi: GetApiService,
    private storage: Storage,
    public alertCtrl: AlertController,
    private toastController: ToastController,
    public loadingController: LoadingController,
    public modalCtrl: ModalController,
  ) { 
    
  }

  ngAfterViewInit() {
    this.storage.get(this.COMPANY_ID).then(companyId => {
      this.storage.get(this.USER_ID).then(userId => {
        this.getapi.getNotification(companyId, userId).subscribe((res: any) => { 
          this.groups = res;
        });
        /*
        this.storage.get(this.ACTIONS).then((val) => {
          if(!val) {
            this.storage.set(this.ACTIONS, Array(res.length).fill(false));
          } else {
            console.log(val);
          }
        });
        */
      });
    });
  }


  eventPrompt(slidingItem: HTMLIonItemSlidingElement) {
    slidingItem.close();

  }


  async presentToast(msg) {
    const toast = await this.toastController.create({
        message: msg,
        position: 'bottom',
        duration: 500
    });
    toast.present();
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

  dismiss(data?: any) {
    this.modalCtrl.dismiss(data);
  }

}
