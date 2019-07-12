import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { GetApiService } from './../../shared/services/get-api.service';
import { environment } from './../../../environments/environment.prod';
import { MenuController, ModalController, AlertController, IonSlides } from '@ionic/angular';
import { Component, ViewChild, OnInit, AfterViewInit, QueryList, ViewChildren } from '@angular/core';
import { Storage } from '@ionic/storage';
import { LinearGauge } from 'ng-canvas-gauges';
import { Router, ActivatedRoute } from '@angular/router';
import { NotiModalComponent } from '../noti-modal/noti-modal.component';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],

})
export class HomePage implements AfterViewInit{

  @ViewChild('slider') slider: IonSlides;

  @ViewChildren('linear_gauge') linearGauge: QueryList<LinearGauge>;
  private interval = null;
  segment = "0";
  badgeNumber: number;

  title: string = "";
  channels: any;
  sensors: any[] = [];
  limits: any[] = [];

  modes = [];

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

  
  constructor (
    private storage: Storage,
    private getapi: GetApiService,
    public menu: MenuController,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public activateroute: ActivatedRoute,
    public router: Router,
    private localNotifications: LocalNotifications,
  ) {

  }

  ionViewDidEnter() {
    this.getTitle();
    this.getCount();
    this.getChannel();
    this.getRealtime();
  }
  
  ngAfterViewInit() {

    /*
    this.interval = setInterval(() => {
      this.getRealtime();
      this.getCount();
      
    }, 60*1000);  
    */

  }
  

  ionViewWillLeave(){
    clearInterval(this.interval);
  }

  getCount() {
    this.storage.get(this.COMPANY_ID).then(companyId => {
      this.storage.get(this.USER_ID).then(userId => {
        this.getapi.getNotiCount(companyId, userId).subscribe((res: any) => { 
          this.badgeNumber = res[0].count;
        });
      });
    });
  }

  async presentNoti() {
    const modal = await this.modalCtrl.create({
      component: NotiModalComponent,
    });
    await modal.present();
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
          this.modes = Array(res.length).fill(0);

          this.linearGauge.changes.subscribe(list => {
              
            list.forEach((gauge,index) => {     
              let range_avg = (res[index].range_min + res[index].range_max)/2;
              gauge.update({
                minValue: res[index].range_min,
                maxValue: res[index].range_max,
                majorTicks: `${res[index].range_min}, ${range_avg}, ${res[index].range_max}`
              });
            }); 
        });
        
        this.storage.get(this.USER_ID).then(userId => {
          this.getapi.getAllLimits(userId).subscribe((limit: any) => { 
            this.limits = limit;
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

  changeMode(num, mode) {
    this.modes[num] = mode;
  }  



}
