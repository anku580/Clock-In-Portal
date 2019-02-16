import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

import { map } from 'rxjs/operators';


interface AuthResponse {
  status: string,
  success: string,
  token: string,
  data: any
};

interface JWTResponse {
  status: string,
  success: string,
  user: any
};



@Injectable({
  providedIn: 'root'
})


export class AuthService {

  tokenKey: string = 'JWT';
  isAuthenticated: Boolean = false;
  user: string;
  id: any;
  username: Subject<string> = new Subject<string>();
  authToken: string = undefined;

  constructor(private http: HttpClient) { }

  sendUsername(name: string) {   
    this.user = name;
    //this.username.next(name);
  }

  sendId(_id: any) {
    this.id = _id;
  }

  clearUsername() {
    //this.username.next(undefined);
    this.user = undefined;
  }

  checkJWTtoken() {
    this.http.get<JWTResponse>('http:localhost:4000/checkJWTtoken')
    .subscribe(res => {
      console.log("JWT Token Valid: ", res);
      this.sendUsername(res.user.username);
    },
    err => {
      console.log("JWT Token invalid: ", err);
      this.destroyUserCredentials();
    })
  }

  loadUserCredentials() {
    var credentials = JSON.parse(localStorage.getItem(this.tokenKey));
    console.log("loadUserCredentials ", credentials);
    if (credentials && credentials.email != undefined) {
      console.log("Inside Credentials")
      this.useCredentials(credentials);
      //  if (this.authToken)
      //     this.checkJWTtoken();
    }
  }

  storeUserCredentials(credentials: any) {
    console.log("storeUserCredentials ", credentials);
    localStorage.setItem(this.tokenKey, JSON.stringify(credentials));
    this.useCredentials(credentials);
  }

  useCredentials(credentials: any) {
    this.isAuthenticated = true;
    console.log("Here:")
    this.sendUsername(credentials.email);
    this.sendId(credentials.id);
    this.authToken = credentials.token;
  }

  destroyUserCredentials() {
    this.authToken = undefined;
    this.clearUsername();
    this.isAuthenticated = false;
    localStorage.removeItem(this.tokenKey);
  }

  logIn(user: any): Observable<any> {
    
    return this.http.post<AuthResponse>('http://localhost:4000/login', {
      "email" : user.email, "password" : user.password
    })
    .pipe(map(res => {
      console.log("Response", res);
      this.storeUserCredentials({email: user.email, token: res.token, id: res.data.id});
      return {'success': true, 'email': user.email };
    },
    err => {
      console.log(err.error.message);
    }))
  }

  logOut() {
    this.destroyUserCredentials();
  }

  isLoggedIn(): Boolean {
    return this.isAuthenticated;
  }

  getUsername(): any {
    
    //this.user = "anku";
    const sendObservable = new Observable(observer => {
  
        observer.next(this.user)
      
    })
    return sendObservable;
    // console.log(this.username.asObservable())
    // return this.username.asObservable();
  }

  getUserid(): any {

    const idObservable = new Observable(observer => {

      observer.next(this.id);
    })

    return idObservable;
  }

  getToken(): string {
    return this.authToken;
  }
}
