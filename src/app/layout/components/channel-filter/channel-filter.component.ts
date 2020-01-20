import { Storage } from '@ionic/storage';
import { ModalController, NavParams, LoadingController } from '@ionic/angular';
import { Component, AfterViewInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { GetApiService } from '../../../shared/services/get-api.service';
import { environment } from '../../../../environments/environment.prod';

@Component({
  selector: 'app-channel-filter',
  templateUrl: './channel-filter.component.html',
  styleUrls: ['./channel-filter.component.scss'],
})
export class ChannelFilterComponent {

  COMPANY_ID = environment.company_id;
  CHANNEL_TOGGLES = environment.channel_toggles;
  channels: {id: number, name: string, isChecked: boolean}[] = [];

  constructor(
    public getapi: GetApiService,
    public modalCtrl: ModalController,
    private storage: Storage,
    public navParams: NavParams,
    public loadingController: LoadingController,
    public alertController: AlertController
  ) {
    
  }

  ionViewDidEnter() {
    this.storage.get(this.COMPANY_ID).then(companyId => {
      this.getapi.getChannel(companyId).subscribe((channelNames: any[]) => {

        this.storage.get(this.CHANNEL_TOGGLES).then(channelIds => {
          if(channelIds == null) {
            channelIds = [];
            channelNames.forEach(day => {
              channelIds.push(day.id);
            });
          }
          const ChannelList = channelIds;
          for(let i = 0; i < channelNames.length; i++) {
              this.channels.push({
                id: channelNames[i].id,
                name: channelNames[i].ch_name,
                isChecked: (ChannelList.indexOf(channelNames[i].id) != -1),
              });
          }
        });
      });
    });
    
  }

  resetFilters() {
    this.channels.forEach(channel => {
      channel.isChecked = true;
    });
  }

  applyFilters() {
    // Pass back a new array of track names to exclude
    
    const ChannelList = this.channels.filter(c => c.isChecked).map(c => c.id);
    
    if(ChannelList.length == 0) {
      this.emptyAlert();
    } else {
      this.storage.set(this.CHANNEL_TOGGLES, ChannelList);
      this.dismiss(ChannelList);
    }
  }

  dismiss(data?: any) {
    // using the injected ModalController this page
    // can "dismiss" itself and pass back data
    this.modalCtrl.dismiss(data);
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

  async emptyAlert() {
    const alert = await this.alertController.create({
      header: '알림',
      message: '최소 1개 이상 채널 선택',
      buttons: ['확인']
    });

    await alert.present();
  }
}
