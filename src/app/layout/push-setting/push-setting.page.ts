import { Storage } from '@ionic/storage';
import { GetApiService } from './../../shared/services/get-api.service';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { PostApiService } from '../../shared/services/post-api.service';

@Component({
  selector: 'app-push-setting',
  templateUrl: './push-setting.page.html',
  styleUrls: ['./push-setting.page.scss'],
})
export class PushSettingPage {

  USER_ID = environment.user_id;

  onoff: boolean;
  state: boolean;
  limits: boolean;
  schedule: boolean;

  constructor(
    private getapi: GetApiService,
    private postapi: PostApiService,
    private storage: Storage,
  ) {
    
  }

  ionViewDidEnter(){
    this.storage.get(this.USER_ID).then(userId => {
      this.getapi.getPushSetting(userId).subscribe((res: any) => { 
        res.forEach(element => {
          this.onoff = element.onoff;
          this.state = element.state;
          this.limits = element.limits;
          this.schedule = element.schedule;
        });
        /*
        this.onoff = res[0].onoff;
        this.state = res[0].state;
        this.limits = res[0].limits;
        this.schedule = res[0].schedule;
        */
      });
    });    
  }

  changeToggle(column, bool) {
    console.log(column);
    const value = {column: column, bool: bool};
    
    this.storage.get(this.USER_ID).then(userId => {
      this.postapi.updateAlarms(userId, value).subscribe();
    
    });
  }

  



}
