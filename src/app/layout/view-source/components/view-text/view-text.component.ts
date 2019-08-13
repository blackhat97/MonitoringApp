import { ActivatedRoute } from '@angular/router';
import { GetApiService } from './../../../../shared/services/get-api.service';
import { environment } from './../../../../../environments/environment.prod';
import { File, IWriteOptions } from '@ionic-native/file/ngx';
import { Angular2CsvComponent } from 'angular2-csv';
import { TableColumn } from '@swimlane/ngx-datatable';
import { FileTransferObject, FileTransfer } from '@ionic-native/file-transfer/ngx';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { ToastController, AlertController, LoadingController, ActionSheetController, Platform } from '@ionic/angular';
import * as papa from 'papaparse';

import * as moment from 'moment';

@Component({
  selector: 'app-view-text',
  templateUrl: './view-text.component.html',
  styleUrls: ['./view-text.component.scss']
})
export class ViewTextComponent implements OnInit {

  @ViewChild(Angular2CsvComponent) csvComponent: Angular2CsvComponent;

  COMPANY_ID = environment.company_id;
  USER_ID = environment.user_id;

  rows = [];
  sensors: any;
  sensorId : string;
  ch_name: string;
  title: string;
  
  today : string;
  yesterday : string;

  loggerForm: FormGroup;
  intervals = [5, 10, 15, 20, 30, 60];
  table_messages = {
    'emptyMessage': '데이터가 없습니다.',
    'totalMessage': ''
  };

  columns = [
    { name: '날짜시간', prop: 'timestamp'},
    { name: '단위', prop: 'unit'},
    { name: '값', prop: 'value'},
    { name: '온도', prop: 'temp'},
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

  constructor(
    private getapi: GetApiService,
    private storage: Storage,
    private formBuilder: FormBuilder,
    private socialSharing: SocialSharing,
    private file: File,
    private alertController: AlertController,
    public actionSheetController: ActionSheetController,
    private transfer: FileTransfer,
    private platform: Platform,
    public loadingController: LoadingController,
    private activatedRoute: ActivatedRoute,
  ) {
    this.sensorId = this.activatedRoute.snapshot.paramMap.get('sensorId');

    this.today = moment().format("YYYY-MM-DD");
    this.yesterday = moment().subtract(1, 'days').format("YYYY-MM-DD");
    

    this.loggerForm =  this.formBuilder.group({
      start: [this.yesterday, [Validators.required]],
      end: [this.today, [Validators.required]]
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

  onSubmit() {
    if (this.loggerForm.invalid) {
      return;
    }

    this.presentLoading();

    const startDate = this.loggerForm.controls['start'].value;
    const endDate = this.loggerForm.controls['end'].value;
    
    if (startDate > endDate) {
      this.showAlert("날짜설정이 잘못되었습니다.");
      return;
    }

    let start = startDate.split("T", 1)[0];
    let end = endDate.split("T", 1)[0];

    this.storage.get(this.USER_ID).then(userId => {
      this.getapi.getViewText(this.sensorId, userId, start, end)
      .subscribe((res: any) => {
        this.rows = res;
      });
    });
    
  }

  getRowClass(row) {
    let limitsBool: boolean;
    if(row.bool_max && row.bool_min) {
      limitsBool = row.value > row.value_max || row.value < row.value_min;
    } else if(row.bool_max) {
      limitsBool = row.value > row.value_max;
    } else if(row.bool_min) {
      limitsBool = row.value < row.value_min;
    }
    return {
      'age-is-ten': limitsBool
    };
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

  async shareCsv() {
    let file = await this.resolveLocalFile();

    this.socialSharing.share("Share message", "Share subject", file.nativeURL, "A URL to share").then(() => {
      this.removeTempFile(file.name);
      console.log("shareSheetShare: Success");
    }).catch(() => {
      console.error("shareSheetShare: failed");
    });
  }

  async shareEmail() {
    let file = await this.resolveLocalFile();

    this.socialSharing.shareViaEmail(null, '수질계측자료', null, null, null, file.nativeURL).then(() => {
      this.removeTempFile(file.name);
    }).catch((e) => {
      // Error!
    });
  }

  downloadCsv() {
    setTimeout(() => { this.csvComponent.onDownload(); }, 0);
  }
  

  async download() {
    const fileTransfer: FileTransferObject = this.transfer.create();
    let path = null;

    if(this.platform.is('ios')) {
      path = this.file.documentsDirectory;
    } else {
      path = this.file.dataDirectory;
    }
        //let path = this.file.externalRootDirectory + '/Download/'; // for Android

    let csv = papa.unparse({
      fields: this.csvHeaders,
      data: this.rows
    });

    let url = 'https://www.stats.govt.nz/assets/Uploads/Annual-enterprise-survey/Annual-enterprise-survey-2017-financial-year-provisional/Download-data/annual-enterprise-survey-2017-financial-year-provisional-csv.csv';

    fileTransfer.download(url, path + 'data.csv', true).then((entry) => {
      this.showAlert(entry.toURL());
    }, (error) => {
      this.showAlert(JSON.stringify(error));
    });
    
  }

  async resolveLocalFile() {
    let options: IWriteOptions = { replace: true };
    let csv = papa.unparse({
      fields: this.csvHeaders,
      data: this.rows
    });
    return this.file.writeFile(this.file.dataDirectory, "data.csv", csv, options);
    //return this.file.copyFile(`${this.file.applicationDirectory}www/assets/img/`, 'arrow.png', this.file.cacheDirectory, `arrow.png`);
  }

  removeTempFile(name) {
    this.file.removeFile(this.file.dataDirectory, name);
    //this.file.removeFile(this.file.cacheDirectory, name);
  }

  showAlert(msg) {
    let alert = this.alertController.create({
      message: msg,
      header: '알림',
      buttons: ['OK']
    });
    alert.then(alert => alert.present());
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: '더보기',
      buttons: [{
        text: '다운로드',
        icon: 'download',
        handler: () => {
          this.downloadCsv();
        }
      },{
        text: '메일',
        icon: 'mail',
        handler: () => {
          this.shareEmail();        
        }
      }]
    });
    await actionSheet.present();
  }

}
