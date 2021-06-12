import { first } from 'rxjs/operators';
import { AlertService } from '@app/_services';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { QuestionsService } from '@app/_services/questions.service';

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
    private questionService: QuestionsService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params.id;
    this.isAddMode = !this.id;

    this.form = this.formBuilder.group({
      question: ['', Validators.required],
      answer: ['', Validators.required],
      image_url: [''],
      option_a: ['', Validators.required],
      option_b: ['', Validators.required],
      option_c: [''],
      option_d: [''],
      option_e: ['']
    });

    if (!this.isAddMode) {
      this.questionService.getById(this.id)
        .pipe(first())
        .subscribe(x => {
          this.f.question.setValue(x.question);
          this.f.answer.setValue(x.answer);
          this.f.image_url.setValue(x.image_url);
          this.f.option_a.setValue(x.option_a);
          this.f.option_b.setValue(x.option_b);
          this.f.option_c.setValue(x.option_c);
          this.f.option_d.setValue(x.option_d);
          this.f.option_e.setValue(x.option_e);
        });
    }
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
      this.createQuestion();
    } else {
      this.updateQuestion();
    }
  }

  private createQuestion() {
    this.questionService.create(this.form.value)
      .pipe(first())
      .subscribe(
        data => {
          this.alertService.success('Question added successfully', { keepAfterRouteChange: true });
          this.router.navigate(['.', { relativeTo: this.route }]);
        },
        error => {
          this.alertService.error(error);
          this.loading = false;
        });
  }

  private updateQuestion() {
    this.questionService.update(this.id, this.form.value)
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
