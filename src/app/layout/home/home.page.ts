import { ChannelFilterComponent } from './../channel-filter/channel-filter.component';
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

  fuck: boolean = true;
  fucks = [];

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

    /*
    this.activateroute.params.subscribe((data: any) => {
      if(data.channels != undefined) {
        this.updateChannel(data.channels);
      }
    });
    */

  }

  ionViewDidEnter() {
    this.getTitle();
    this.getCount();
    this.getChannel();
    this.getRealtime();
  }

  
  ngAfterViewInit() {

    this.interval = setInterval(() => {
      this.getRealtime();
      this.getCount();
      
    }, 60*1000);  
    
  }
  

  ionViewWillLeave(){
    clearInterval(this.interval);
  }


  scheduleNotification() {
    this.localNotifications.schedule({
      id: 1,
      title: 'Attention',
      text: 'Simons Notification',
      data: { mydata: 'My hidden message this is' },
      trigger: {at: new Date(new Date().getTime())},
      foreground: true // Show the notification while app is open
    });
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
      this.storage.get(this.CHANNEL_TOGGLES).then(channelIds => {

        if(channelIds != null) {
          this.getapi.getSelectedChannel(companyId, channelIds).subscribe((res: any) => {  
            this.channels = res;
          });
        } else {
          this.getapi.getChannel(companyId).subscribe((res: any) => {  
            this.channels = res;
          });
        }
      });
    });
  }


  getRealtime(){

    this.storage.get(this.COMPANY_ID).then(companyId => {
      this.storage.get(this.CHANNEL_TOGGLES).then(channelIds => {

        if(channelIds != null) {
          this.getapi.getSelectedRealtime(companyId, channelIds).subscribe((res: any) => {  
            this.sensors = res;
            this.fucks = Array(res.length).fill(true);
            
            this.linearGauge.changes.subscribe(list => {
                
                list.forEach((gauge,index) => {     
                  //console.log(index);
                  let range_avg = (res[index].range_min + res[index].range_max)/2;
                  gauge.update({
                    minValue: res[index].range_min,
                    maxValue: res[index].range_max,
                    majorTicks: `${res[index].range_min}, ${range_avg}, ${res[index].range_max}`
                  });
                });
            });


          });
        } else {
          this.getapi.getRealtime(companyId).subscribe((res: any) => {
            this.sensors = res;
            this.fucks = Array(res.length).fill(true);

            this.linearGauge.changes.subscribe(list => {
                
              list.forEach((gauge,index) => {     
                //console.log(index);
                let range_avg = (res[index].range_min + res[index].range_max)/2;
                gauge.update({
                  minValue: res[index].range_min,
                  maxValue: res[index].range_max,
                  majorTicks: `${res[index].range_min}, ${range_avg}, ${res[index].range_max}`
                });
              }); 
          });
            
          });
        }

        this.storage.get(this.USER_ID).then(userId => {
          this.getapi.getAllLimits(userId).subscribe((limit: any) => { 
            this.limits = limit;
          
          });
        });

      });
    });

  }

  updateChannel(channel_ids) {
    this.storage.get(this.COMPANY_ID).then(companyId => {
      this.getapi.getSelectedChannel(companyId, channel_ids).subscribe((res: any) => {  
        this.channels = res;
      });
      this.getapi.getSelectedRealtime(companyId, channel_ids).subscribe((res: any) => {
        this.sensors = res;
        this.fucks = Array(res.length).fill(true);

      });
    });
  }

  moveDetail(id) {
    this.router.navigateByUrl('/detail/${id}');
    //this.navCtrl.navigateForward(`/detail/${id}`);
  }

  doRefresh(event) {
    this.getRealtime();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }


  selectedTab(ind){
    this.slider.slideTo(ind);
  }

  moveButton($event) {
    this.segment = $event.target.swiper.activeIndex.toString();
  }

  test(num) {
    //this.fuck = !this.fuck;
    this.fucks[num] = !this.fucks[num];
  }

}
