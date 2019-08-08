import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from './../shared/services/authentication.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.page.html',
  styleUrls: ['./reset.page.scss'],
})
export class ResetPage implements OnInit {
  
  resetForm: FormGroup;
  token : string;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private activatedRoute: ActivatedRoute,

  ) { 
    this.token = this.activatedRoute.snapshot.paramMap.get('token');
  }

  ngOnInit() {
    this.resetForm = this.formBuilder.group({
      newpass: ['', [Validators.required, Validators.minLength(6)]],
      passchk: ['', [Validators.required]]
    });
  }

  onSubmit() {
    this.authService.reset(this.token, this.resetForm.value).subscribe();

  }

}
