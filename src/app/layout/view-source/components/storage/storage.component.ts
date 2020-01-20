import { TableColumn } from '@swimlane/ngx-datatable';
import { GetApiService } from './../../../../shared/services/get-api.service';
import { LoadingController, AlertController } from '@ionic/angular';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { environment } from '../../../../../environments/environment.prod';
import * as moment from 'moment';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { File, IWriteOptions } from '@ionic-native/file/ngx';
import * as papa from 'papaparse';
import { SupportService } from '../../../../shared/services/support-service';

@Component({
  selector: 'app-storage',
  templateUrl: './storage.component.html',
  styleUrls: ['./storage.component.scss']
})
export class StorageComponent implements OnInit {

  rows = [];
  columns = [
    { name: '날짜시간', prop: 'timestamp'},
    { name: '알림내용', prop: 'event'},
    { name: '조치', prop: 'action'},
    
  ];
  csvHeaders = 
  this.columns.map((column: TableColumn) => column.prop)
  .filter((e) => e);
  
  csvOptions = {
    fieldSeparator  : ',',
    quoteStrings    : '"',
    decimalseparator: '.',
    showLabels      : true,
    headers         : this.csvHeaders,
    showTitle       : false,
    title           : 'Report',
    useBom          : true
  }

  sensorId : string;
  ch_name: string;
  title: string;

  today : string;
  yesterday : string;
  email : string = "";

  USER_ID = environment.user_id;
  COMPANY_ID = environment.company_id;
  USERNAME = environment.username;

  MSG_OK = environment.msg_ok;
  MSG_NETWORK_ERROR = environment.msg_network_error;
  MSG_CORRECTION = environment.msg_correction;
  MSG_REPLACE = environment.msg_replace;
  MSG_TROUBLE = environment.msg_trouble;
  MSG_CLEAN = environment.msg_clean;
  MSG_RANGE_OFF = environment.msg_range_off;
  
  table_messages = {
    'emptyMessage': '데이터가 없습니다.',
    'totalMessage': ''
  };

  eventForm: FormGroup;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    public loadingController: LoadingController,
    private alertController: AlertController,
    private storage: Storage,
    private getapi: GetApiService,
    private socialSharing: SocialSharing,
    private file: File,
    private support: SupportService,

  ) { 
    this.sensorId = this.activatedRoute.snapshot.paramMap.get('sensorId');
    
    this.today = moment().format("YYYY-MM-DD");
    this.yesterday = moment().subtract(1, 'days').format("YYYY-MM-DD");
    
    this.eventForm =  this.formBuilder.group({
      start: [this.yesterday, [Validators.required]],
      end: [this.today, [Validators.required]]
    });

  }

  ionViewWillEnter(){
    this.storage.get(this.COMPANY_ID).then(companyId => {
      this.storage.get(this.USER_ID).then(userId => {
        this.getapi.getViewSourceStorage(this.sensorId, companyId, userId, this.yesterday, this.today)
        .subscribe((res: any) => {
          res.forEach(element => {
            if(element.state == null) {
              element.event = `${this.MSG_RANGE_OFF} (측정값): ${element.value}${element.unit}`;      
            } else if(element.value == null) {
              switch (element.state){
                case "00" :
                  element.event = this.MSG_OK;
                  break;
                case "02" :
                  element.event = this.MSG_NETWORK_ERROR;
                  break;
                case "03" :
                  element.event = this.MSG_CORRECTION;
                  break;
                case "04" :
                  element.event = this.MSG_REPLACE;
                  break;
                case "06" :
                  element.event = this.MSG_TROUBLE;
                  break;
                case "07" :
                  element.event = this.MSG_CLEAN;
                  break;
                default :
                  console.log("State Wrong");
              }
            }
          });

          this.rows = res;

        });
      });
    });
    this.storage.get(this.USERNAME).then(username => {
      this.getapi.getProfile(username).subscribe((res) => {
        this.email = res[0].email;
      });
    });


  }

  ngOnInit() {
    
    this.storage.ready().then(() => {
      this.storage.get(this.USER_ID).then(userId => {
        this.getapi.getInfoBasic(this.sensorId, userId).subscribe((info: any) => {
          this.ch_name = info[0].ch_name;
          this.title = info[0].name_tag;
        });
      });
    });
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      duration: 500,
      message: '로딩중...',
      spinner: 'bubbles',
      translucent: true,
      cssClass: 'custom-class custom-loading'
    });
    return await loading.present();
  }

  onSubmit() {
    if (this.eventForm.invalid) {
      return;
    }

    this.presentLoading();
    const startDate = this.eventForm.controls['start'].value;
    const endDate = this.eventForm.controls['end'].value;

    if (startDate > endDate) {
      this.showAlert("날짜설정이 잘못되었습니다.");
      return;
    }

    let start = startDate.split("T", 1)[0];
    let end = endDate.split("T", 1)[0];

    this.storage.get(this.COMPANY_ID).then(companyId => {
      this.storage.get(this.USER_ID).then(userId => {
        this.getapi.getViewSourceStorage(this.sensorId, companyId, userId, start, end)
        .subscribe((res: any) => {
          this.rows = res;
        });
      });
    });

  }

  showAlert(msg) {
    let alert = this.alertController.create({
      message: msg,
      header: '알림',
      buttons: ['OK']
    });
    alert.then(alert => alert.present());
  }

  async shareEmail() {
    let file = await this.resolveLocalFile();
    
    this.socialSharing.shareViaEmail(null, '수질계측이벤트자료', [this.email], null, null, file.nativeURL).then(() => {
      this.support.presentToast("메일이 발송되었습니다.");
      this.removeTempFile(file.name);
    }).catch((e) => {
      // Error!
    });
  }

  async resolveLocalFile() {
    
    let options: IWriteOptions = { replace: true };
    let csv = papa.unparse({
      fields: this.csvHeaders,
      data: this.rows,
    });
    const csvname = `${this.ch_name}_${this.title}_event.csv`;

    return this.file.writeFile(this.file.dataDirectory, csvname, csv, options);

  }

  removeTempFile(name) {
    this.file.removeFile(this.file.dataDirectory, name);
  }


}
