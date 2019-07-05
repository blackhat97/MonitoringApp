import { GetApiService } from './../../shared/services/get-api.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { IonSlides, NavController, IonContent } from '@ionic/angular';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage  {

  @ViewChild(IonContent) content: IonContent;

  @ViewChild('slider') slider: IonSlides;
  sensorId : string;
  progress = 0;
  private interval = null;
  title: string;
  segment = "0";
  slideOpts: any = {allowTouchMove: false};


  constructor(
    private activatedRoute: ActivatedRoute,
    public location: Location,
    private getapi: GetApiService,
    public router: Router,

  ) {
    this.sensorId = this.activatedRoute.snapshot.paramMap.get('sensorId');
    this.getapi.getSensor(this.sensorId).subscribe((res: any) => {
      this.title = res[0].name_tag;
    });

    this.interval = setInterval(() => {
      if(this.progress < .9) {
        this.progress += .1;
      } else {
        clearInterval(this.interval);
        this.progress = 0;
      }
    }, 50);

  }


  goBack() {
    this.location.back();
    //this.router.navigate(['/home'], { replaceUrl: true });

  }

  selectedTab(ind){
    this.slider.slideTo(ind);
  }

  moveButton($event) {
    this.segment = $event.target.swiper.activeIndex.toString();
  }

  ScrollToBottom(){
    this.content.scrollToBottom(1500);
  }

  ScrollToTop(){
    this.content.scrollToTop(1500);
  }




}
