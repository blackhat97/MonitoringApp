import { LoadingController, AlertController } from '@ionic/angular';
import { GetApiService } from './../../../../shared/services/get-api.service';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { environment } from './../../../../../environments/environment.prod';
import { Component, OnInit } from '@angular/core';


/** echarts extensions: */
import 'echarts/theme/macarons.js';
import 'echarts/dist/extension/bmap.min.js';

import * as moment from 'moment';
import { Storage } from '@ionic/storage';


@Component({
  selector: 'app-trend',
  templateUrl: './trend.component.html',
  styleUrls: ['./trend.component.scss']
})
export class TrendComponent implements OnInit {

  USER_ID = environment.user_id;

  timestamp : any = [];
  value : any = [];

  max : number = 0;
  min : number = 0;
  avg : string = '';
  
  sensorId : string;
  tableName : string;
  unit: string;
  ch_name: string;
  title: string;

  today : string;
  yesterday : string;

  updateOption: any;

  chartForm: FormGroup;
  
  optionValue = {
    color: ['#80ccff'],
    title: [{
      left: 'center',
    }],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
          type: 'line',
          crossStyle: {
              color: '#999'
          }
      }
    },
    dataZoom: [
      {
        type: 'slider',
        xAxisIndex: 0,
        start: 40,
        end: 60,
        filterMode: 'empty'
      },
      {
        type: 'slider',
        yAxisIndex: 0,
        filterMode: 'empty'
      },

      /*
      {
        type: 'inside',
        xAxisIndex: 0,

        filterMode: 'empty'
      },
      {
        type: 'inside',
        yAxisIndex: 0,
        filterMode: 'empty'
      },
      {
          show: true,
          realtime: true,
          start: 30,
          end: 70,
      }
      */
      
    ],
    xAxis: [
      {
        type: 'category',
        boundaryGap : false,
        scale: true,
        data: this.timestamp,
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
    series: [
      {
        type: 'line',
        barWidth: '60%',
        symbol: 'none',
        data: this.value,
      }
    ]
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private getapi: GetApiService,
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private storage: Storage,
    public loadingController: LoadingController,

  ) { 
    this.sensorId = this.activatedRoute.snapshot.paramMap.get('sensorId');
    
    this.today = moment().format("YYYY-MM-DD");
    this.yesterday = moment().subtract(1, 'days').format("YYYY-MM-DD");
    
    this.chartForm =  this.formBuilder.group({
      start: [this.yesterday, [Validators.required]],
      end: [this.today, [Validators.required]],
    });
  }

  ionViewDidEnter(){
    this.getChart(this.sensorId , this.today, this.yesterday);   
  }

  ngOnInit() {

    this.storage.ready().then(() => {
      this.storage.get(this.USER_ID).then(userId => {
        
        this.getapi.getInfoBasic(this.sensorId, userId).subscribe((info: any) => {
          this.ch_name = info[0].ch_name;
          this.title = info[0].name_tag;
          this.unit = info[0].unit;
          this.getapi.getInfoLimits(this.sensorId, userId).subscribe((limits: any) => {
            let rArray = [];
            if(limits[0].bool_max) {
              rArray.push({name: '최대', type:'max', yAxis: limits[0].value_max, itemStyle:{normal:{color:'#8B4513'}}});
            }
            if(limits[0].bool_min) {
              rArray.push({name: '최소', type:'min', yAxis: limits[0].value_min, itemStyle:{normal:{color:'#8B4513'}}});
            }
            
            this.updateOption = {
              yAxis: [{
                  name: info[0].unit
              }],
              series: [{
                name: info[0].type,
                markLine: {
                  symbol: ['none'],
                  data: rArray,
                }
              }]
            };
          });
        });

      });
    });
  }

  getChart(sensorId, today, yesterday) {

    this.storage.get(this.USER_ID).then(userId => {
      this.getapi.getChart(sensorId, userId, today, yesterday).subscribe((data: any) => {
        
        for(let i=0; i<data.length; i++) {
          let dateString = moment.unix(data[i].timestamp).format("MM/DD HH:mm");
          this.timestamp.push(dateString);
          this.value.push(data[i].value);
        }
        const total = this.value.reduce((a, b) => a + b);
        this.max = this.value.reduce((a, b)=>Math.max(a, b)); 
        this.min = this.value.reduce((a, b)=>Math.min(a, b)); 
        this.avg = (total / this.value.length).toFixed(1) || '0';

      });
    });

  }

  onSubmit() {

    const startDate = this.chartForm.controls['start'].value;
    const endDate = this.chartForm.controls['end'].value;
    
    if (startDate > endDate) {
      this.showAlert("날짜설정이 잘못되었습니다.");
      return;
    }

    let start = startDate.split("T", 1)[0];
    let end = endDate.split("T", 1)[0];

    this.getapi.updateChart(this.sensorId, start, end)
    .subscribe((data: any) => {
      if(data[0] == null) {
        this.showAlert("데이터가 존재하지 않습니다.");
        return;
      } else {

        this.presentLoading();

        this.timestamp = [];
        this.value = [];
        
        for(let i=0; i<data.length; i++) {        
          let dateString = moment.unix(data[i].timestamp).format("MM/DD HH:mm");
          this.timestamp.push(dateString);
          this.value.push(data[i].value);  
        }

        const total = this.value.reduce((a, b) => a + b);
        this.max = this.value.reduce((a, b)=>Math.max(a, b)); 
        this.min = this.value.reduce((a, b)=>Math.min(a, b)); 
        this.avg = (total / this.value.length).toFixed(1) || '0';

        this.updateOption = {
          series: [{
            data: this.value
          }],
          xAxis: [
          {
            data: this.timestamp
          }]
        };

      }
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

  async presentLoading() {
    const loading = await this.loadingController.create({
      duration: 500,
      spinner: 'bubbles',
      translucent: true,
      cssClass: 'custom-class custom-loading'
    });
    return await loading.present();
  }


}
