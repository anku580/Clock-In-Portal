import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router'


interface SignUp {
  status: string,
  message: string,
};

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})


export class SignupComponent implements OnInit {


  signupForm: FormGroup;
  submitted = null;
  signupDetails: any;

  formErrors = {
    'email': '',
    'password': ''
  };

  validationMessages = {
    'email': {
      'required': 'Email is required.',
      'email': 'Email not in valid format'
    },
    'password': {
      'required': 'password is required.',
      'minlength': 'password must be at least 2 characters long',
      'maxlength': 'password cannot be more than 25 characters long'
    }
    
  };

  constructor(private fb: FormBuilder,
              private http: HttpClient,
              private router: Router) {

  }

  ngOnInit() {
    this.createForm();
  }

  createForm(){

    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(25)]]
    })

    this.signupForm.valueChanges
    .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  onValueChanged(data?: any) {
    if (!this.signupForm) { return; }
    const form = this.signupForm;

    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  onSubmit() {

    this.signupDetails = this.signupForm.value;
    console.log(this.signupDetails);
    this.http.post<SignUp>('http://localhost:4000/signup', this.signupDetails)
    .subscribe((res) => {
      if(res.status === 'success') {
        alert("Account Created");
        this.router.navigateByUrl('/login')
      }
    })

  }

}
