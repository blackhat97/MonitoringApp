import { ChannelFilterComponent } from './../channel-filter/channel-filter.component';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { GetApiService } from './../../shared/services/get-api.service';
import { environment } from './../../../environments/environment.prod';
import { MenuController, ModalController, AlertController, IonSlides, NavController, LoadingController } from '@ionic/angular';
import { Component, ViewChild, OnInit, AfterViewInit, QueryList, ViewChildren } from '@angular/core';
import { Storage } from '@ionic/storage';
import { LinearGauge } from 'ng-canvas-gauges';
import { Router, ActivatedRoute } from '@angular/router';
import { NotiModalComponent } from '../noti-modal/noti-modal.component';

import * as moment from 'moment';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],

})
export class HomePage {

  @ViewChild('slider') slider: IonSlides;

  @ViewChildren('linear_gauge') linearGauge: QueryList<LinearGauge>;
  segment = "0";
  badgeNumber: number;

  title: string = "";
  channels: any;
  sensors: any[] = [];
  limits: any[] = [];
  existLimit: boolean[] = [];

  modes = [];
  getError: boolean = false;

  USER_NAME = environment.username;
  COMPANY_ID = environment.company_id;
  CHANNEL_TOGGLES = environment.channel_toggles;
  USER_ID = environment.user_id;

  MSG_OK = environment.msg_ok;
  MSG_NETWORK_ERROR = environment.msg_network_error;
  MSG_CORRECTION = environment.msg_correction;
  MSG_REPLACE = environment.msg_replace;
  MSG_TROUBLE = environment.msg_trouble;
  MSG_CLEAN = environment.msg_clean;

  MSG_MAX = environment.msg_max;
  MSG_MIN = environment.msg_min;


  updateOption: any[] = [];

  optionValue = {
    color: ['#80ccff'],
    title: [{
      left: 'center',
    }],
    xAxis: [
      {
        type: 'category',
        boundaryGap : false,
        scale: true,
      }
    ],
    yAxis: [
      {
        type: 'value',
        splitArea: {
          show: true
        },
      }
    ],
  };
  
  constructor (
    public navCtrl: NavController,
    private storage: Storage,
    private getapi: GetApiService,
    public menu: MenuController,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public activateroute: ActivatedRoute,
    public router: Router,
  ) {
  }

  ionViewDidEnter(){
    this.getTitle();
    this.getCount();
    this.getChannel();
    this.getRealtime();

  }
  

  getCount() {
    this.storage.get(this.COMPANY_ID).then(companyId => {
      this.storage.get(this.USER_ID).then(userId => {
        /*
        this.getapi.getNotiCount(companyId, userId).subscribe((res: any) => { 
          this.badgeNumber = res[0].count;
        });
        */
       this.badgeNumber = 0;
      });
    });
  }

  async presentNoti() {
    const modal = await this.modalCtrl.create({
      component: NotiModalComponent,
    });
    await modal.present();
  }

  async presentFilter() {
    const modal = await this.modalCtrl.create({
      component: ChannelFilterComponent,
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if(data) {
      this.updateChannel(data);
    } 
  }

  updateChannel(channel_ids) {
    this.storage.get(this.COMPANY_ID).then(companyId => {
      this.getapi.getSelectedChannel(companyId, channel_ids).subscribe((res: any) => {  
        this.channels = res;
      });
      this.getapi.getSelectedRealtime(companyId, channel_ids).subscribe((res: any) => {
        this.sensors = res;
      });
    });
  }

  getTitle(){
    this.storage.get(this.COMPANY_ID).then(companyId => {
      this.getapi.getCompany(companyId).subscribe((res: any) => { 
        res.forEach(element => {
          this.title = element.company;
        });
      });
    });
  }

  getChannel() {
    this.storage.get(this.COMPANY_ID).then(companyId => {
      this.getapi.getChannel(companyId).subscribe((res: any) => {  
        this.channels = res;
      });
    });
  }


  getRealtime(){

    this.storage.get(this.COMPANY_ID).then(companyId => {
      this.getapi.getRealtime(companyId).subscribe((res: any) => {
        this.sensors = res;
        //console.log(res);
        this.existLimit =  Array(res.length).fill(false);
        this.modes = Array(res.length).fill(0);
        
        this.storage.get(this.USER_ID).then(userId => {
          this.getapi.getAllLimits(userId).subscribe((limit: any) => { 
            this.limits = limit;
            res.forEach((element1, index) => {
              limit.forEach(element2 => {
                if (element1.id == element2.sensor_id) {
                  this.existLimit[index] = true;
                }
              });
            });
          });
        });
      });
    });
    
  }

  
  doRefresh(event) {
    this.getRealtime();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  changeMode(num, mode, id?: any) {


    if(mode === 2) {

      let range_min = this.sensors[num].range_min;
      let range_max = this.sensors[num].range_max;
      let range_avg = (range_min + range_max)/2;
  
      this.linearGauge.changes.subscribe((gauges: any) => {
        
        gauges.some((gauge: any, index: number) => {   
          if(num === index) {
          gauge.update({
            minValue: range_min,
            maxValue: range_max,
            majorTicks: `${range_min}, ${range_avg}, ${range_max}`
          });
        }
        });
        

      });

    } else if(mode === 3) {

      let value : any = [];
      let timestamp : any = [];

      this.getapi.getHomeChart(id).subscribe((data: any) => {
        
        for(let i=0; i<data.length; i++) {
          let dateString = moment.unix(data[i].timestamp).format("HH:mm");
          timestamp.push(dateString);
          value.push(data[i].value);
        }

        this.updateOption[num] = {     
          
          series: [
            {
              type: 'line',
              barWidth: '60%',
              symbol: 'none',
              data: value,
            }
          ],
          xAxis: [
            {
              data: timestamp
            }
          ]
        }

      
      });

    }
    this.modes[num] = mode;
  }

  moveViewSource(url) {
    this.navCtrl.navigateForward(`/view-source/trend/${url}`);

  }

  moveSettings(url) {
    this.navCtrl.navigateForward(`/settings/${url}`);
  }


}
