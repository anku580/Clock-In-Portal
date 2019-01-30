import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router'

import { AuthService } from '../services/auth.service';

export interface clockoutput {
  message: string;
  clock_in: any;
}
export interface Category {
  value: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  username: string = undefined;
  subscription: Subscription;
  mobileQuery: MediaQueryList;
  time: any;
  id: any = undefined;
  hour : any = 0;
  minute : any = 0;
  seconds : any = 0;
  totalSeconds : any = 0;
  interval : any;

  categories: Category[] = [
    {value: 'Current Week'},
    {value: 'Last Week'},
    {value: 'By Date'},
    {value: 'Advanced'}
  ];

  selected = 'Last Week';

  fillerNav = Array.from({ length: 5 }, (_, i) => `Nav Item this is a ${i + 1}`);


  private _mobileQueryListener: () => void;

  constructor(changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher, private http: HttpClient,
    private authService: AuthService,
    private router: Router,
  ) {

    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
    this.authService.loadUserCredentials();
    this.subscription = this.authService.getUsername()
    .subscribe(name => { 
        // console.log(name);
        this.username = name;
    });
    this.subscription = this.authService.getUserid()
    .subscribe(id => {
      this.id = id;
    })

    this.http.post<clockoutput>('http://localhost:4000/check_clock_request', { 'email' : this.username})
    .subscribe((output) => {
      if(output.message != 'No data found') {
        console.log(output);
        this.time = output.clock_in;
        this.time = this.time.slice(16,24);
        let newDate = new Date().toString();
        newDate = newDate.slice(16,24);

        let timeHour;
        let timeMinute;
        let timeSecond;
        let newDateHour; 
        let newDateMinute;
        let newDateSecond;

        timeHour = this.time.slice(0,2);
        timeMinute = this.time.slice(3,5);
        timeSecond = this.time.slice(6,8);

        newDateHour = newDate.slice(0,2);
        newDateMinute = newDate.slice(3,5);
        newDateSecond = newDate.slice(6,8);      
        
        this.hour = newDateHour - timeHour;
        this.minute = newDateMinute - timeMinute;
        this.seconds = newDateSecond - timeSecond;

        this.totalSeconds = this.hour*3600 + this.minute*60 + this.seconds;
        this.initiateTimer();
      }
    })
    
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  logOut() {
    this.username = undefined;
    this.id = undefined;
    this.authService.logOut();
    this.router.navigateByUrl('/login');
  }

  // let timerVar = setInterval(startTimer, 1000);
  
  startTimer(){
  
    this.http.post<clockoutput>('http://localhost:4000/addclockindata', {"email" : this.username})
    .subscribe((output) =>{
      alert(output.message);
      this.totalSeconds = 0;
    })
    this.interval = setInterval( () => 
    {
      ++this.totalSeconds;
      this.hour = Math.floor(this.totalSeconds/3600);
      this.minute = Math.floor((this.totalSeconds - this.hour*3600)/60);
      this.seconds = this.totalSeconds - (this.hour*3600 + this.minute*60);
    }
    , 1000)
  }

  initiateTimer() {
    this.interval = setInterval( () => 
    {
      ++this.totalSeconds;
      this.hour = Math.floor(this.totalSeconds/3600);
      this.minute = Math.floor((this.totalSeconds - this.hour*3600)/60);
      this.seconds = this.totalSeconds - (this.hour*3600 + this.minute*60);
    }
    , 1000)
  }

  stopTimer() {
    clearInterval(this.interval);
    this.http.post<clockoutput>('http://localhost:4000/addclockoutdata',{ "email" : this.username})
    .subscribe((output) => {
      alert(output.message);
      this.hour = 0;
      this.minute = 0;
      this.seconds = 0;
    })
  }

}
