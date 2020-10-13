import { first } from 'rxjs/operators';
import { AlertService } from '@app/_services';
import { OffenderService } from '../../_services/offender.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  templateUrl: './add-edit.component.html',
})
export class AddEditComponent implements OnInit {

  form: FormGroup;
  id: string;
  isAddMode: boolean;
  loading = false;
  submitted = false;
  years = [];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private offenderService: OffenderService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params.id;
    this.isAddMode = !this.id;

    // password not required in edit mode
    const passwordValidators = [Validators.minLength(6)];
    if (this.isAddMode) {
      passwordValidators.push(Validators.required);
    }

    this.form = this.formBuilder.group({
      email: ['', Validators.required],
      courtorderid: ['', Validators.required],
      firstname: ['', Validators.required],
      middlename: [''],
      lastname: ['', Validators.required],
      phonenumber: ['', Validators.required],
      class: ['', Validators.required],
      year: ['', Validators.required],
    });

    if (!this.isAddMode) {
      this.offenderService.getById(this.id)
        .pipe(first())
        .subscribe(x => {
          this.f.email.setValue(x.email);
          this.f.courtorderid.setValue(x.courtorderid);
          this.f.firstname.setValue(x.firstname);
          this.f.middlename.setValue(x.middlename);
          this.f.lastname.setValue(x.lastname);
          this.f.phonenumber.setValue(x.phonenumber);
          this.f.class.setValue(x.class);
          this.f.year.setValue(x.year);
        });
    }

    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i < currentYear + 10; i++) {
      this.years.push(i);
    }

    this.f.year.setValue(currentYear);
  }

  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    if (this.isAddMode) {
      this.createOffender();
    } else {
      this.updateOffender();
    }
  }

  private createOffender() {
    this.offenderService.create(this.form.value)
      .pipe(first())
      .subscribe(
        data => {
          this.alertService.success('Offender added successfully', { keepAfterRouteChange: true });
          this.router.navigate(['.', { relativeTo: this.route }]);
        },
        error => {
          this.alertService.error(error);
          this.loading = false;
        });
  }

  private updateOffender() {
    this.offenderService.update(this.id, this.form.value)
      .pipe(first())
      .subscribe(
        data => {
          this.alertService.success('Update successful', { keepAfterRouteChange: true });
          this.router.navigate(['..', { relativeTo: this.route }]);
        },
        error => {
          this.alertService.error(error);
          this.loading = false;
        });
  }

}
