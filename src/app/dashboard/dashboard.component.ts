import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';

import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { FormGroup, FormBuilder } from '@angular/forms';

export interface clockoutput {
  message: string;
  clock_in: any;
  error: any;
  minutes: any;
  hours: any,
  seconds: any;
}

export interface displaydata {
  data: any;
}

export interface lunchoutput {
  message: string;
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
  hour: any = 0;
  minute: any = 0;
  seconds: any = 0;
  totalSeconds: any = 0;
  interval: any;
  item: any;
  flag: boolean = false;
  datepicker: FormGroup;

  categories: Category[] = [
    { value: 'Current Week' },
    { value: 'Last Week' },
    { value: 'By Date' },
    { value: 'Advanced' }
  ];

  selected = 'Last Week';

  fillerNav = Array.from({ length: 5 }, (_, i) => `Nav Item this is a ${i + 1}`);

  private _mobileQueryListener: () => void;

  constructor(changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher, private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
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

    this.http.post<clockoutput>('http://localhost:4000/check_clock_request', { 'email': this.username })
      .subscribe((output) => {
        if (output.message != 'The user has not clocked-in yet') {

          this.hour = output.hours;
          this.seconds = output.seconds;
          this.minute = output.minutes;
          this.totalSeconds = this.hour * 3600 + parseInt(this.minute) * 60 + parseInt(this.seconds);
          this.initiateTimer();
        }
      },
        err => {
          console.log(err.error.message);
        })
    this.createForm();
  }

  createForm() {

    this.datepicker = this.fb.group({
      startDate: ['',],
      endDate: ['',],
      day: ['',]
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

  startTimer() {

    this.http.post<clockoutput>('http://localhost:4000/addclockindata', { "email": this.username })
      .subscribe((output) => {
        console.log(output)
        alert(output.message);
        this.totalSeconds = 0;
        this.interval = setInterval(() => {
          ++this.totalSeconds;
          this.hour = Math.floor(this.totalSeconds / 3600);
          this.minute = Math.floor((this.totalSeconds - this.hour * 3600) / 60);
          this.seconds = this.totalSeconds - (this.hour * 3600 + this.minute * 60);
        }
          , 1000)
      },
        err => { console.log(err.error.message)
        alert(err.error.message) })

  }

  startLunchTimer() {

    this.http.post<lunchoutput>('http://localhost:4000/addlunchindata', { "email": this.username })
      .subscribe((output) => {
        alert(output.message);
      },
        err => {
          console.log(err.error.message);
        })
  }

  stopLunchTimer() {

    this.http.post<lunchoutput>('http://localhost:4000/lunchoutdata', { "email": this.username })
      .subscribe((output) => {
        alert(output.message);
      },
        err => {
          console.log(err.error.message);
        })
  }


  initiateTimer() {
    this.interval = setInterval(() => {
      ++this.totalSeconds;
      this.hour = Math.floor(this.totalSeconds / 3600);
      this.minute = Math.floor((this.totalSeconds - this.hour * 3600) / 60);
      this.seconds = this.totalSeconds - (this.hour * 3600 + this.minute * 60);
    }
      , 1000)
  }

  stopTimer() {
    clearInterval(this.interval);
    this.http.post<clockoutput>('http://localhost:4000/addclockoutdata', { "email": this.username })
      .subscribe((output) => {
        alert(output.message);
        this.hour = 0;
        this.minute = 0;
        this.seconds = 0;
      },
        err => {
          console.log(err.error.message);
        })
  }

  currentWeekData() {
    this.flag = false;
    this.http.post<displaydata>('http://localhost:4000/getcurrentweekdata', { "email": this.username })
      .subscribe((output) => {
        console.log(output.data)
        this.item = output.data;
      },
        err => {
          console.log(err.error.message);
        })
  }

  lastWeekData() {
    this.flag = false;
    this.http.post<displaydata>('http://localhost:4000/getlastweekdata', { "email": this.username })
      .subscribe((output) => {
        this.item = output.data;
      },
        err => {
          console.log(err.error.message);
        })
  }

  displayByDate() {
    this.item = undefined;
    this.flag = true;

  }

  onSubmit() {
    this.item = undefined;
    console.log(this.datepicker.value);
    let send_date = {
      startDate: this.datepicker.value.startDate.toString(),
      endDate: this.datepicker.value.endDate.toString(),
      email: this.username,
      day: this.datepicker.value.day
    };

    if (send_date.day == "") {
      this.http.post<displaydata>('http://localhost:4000/getdatabydates', send_date)
        .subscribe((output) => {
          this.item = output;
        },
          err => {
            console.log(err.error.message);
          })
    }

    else {
      this.http.post<displaydata>('http://localhost:4000/getdaysinamonth', send_date)
        .subscribe((output) => {
          this.item = output;
        },
          err => {
            console.log(err.error.message);
          })
    }

  }

  commonTimer() {
    var checkBox = document.getElementById("togBtn");
    // if (checkBox.checked == true){

    // }
  }

}
