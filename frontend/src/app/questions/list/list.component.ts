import { first } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { QuestionsService } from '@app/_services/questions.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '@app/_services';
import { AnswersService } from '@app/_services/answers.service';

@Component({
  templateUrl: './list.component.html',
})
export class ListComponent implements OnInit {
  questions = null;
  questionId;
  questionDeleted = false;
  form: FormGroup;
  submitted = false;
  loading = false;

  constructor(
    private questionsService: QuestionsService,
    private answersService: AnswersService,
    private formBuilder: FormBuilder,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      admin_email: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$'),
        ]),
      ],
      cutoff_mark: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern('^[0-9]*$'),
        ]),
      ],
      admin_phone_number: ['', Validators.required],
      time_required: ['', Validators.required],
    });

    this.questionsService
      .getAll()
      .pipe(first())
      .subscribe((questions) => {
        this.questions = questions;
      });

    this.questionsService
      .getSettings()
      .pipe(first())
      .subscribe((questionSettings) => {
        questionSettings.forEach((qs) => {
          if (qs.name === 'admin_email') {
            this.f.admin_email.setValue(qs.value);
          }

          if (qs.name === 'cutoff_mark') {
            this.f.cutoff_mark.setValue(qs.value);
          }

          if (qs.name === 'admin_phone_number') {
            this.f.admin_phone_number.setValue(qs.value);
          }

          if (qs.name === 'time_required') {
            this.f.time_required.setValue(qs.value);
          }
        });
      });
  }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.questionsService
      .saveQuestionSettings(this.form.value)
      .pipe(first())
      .subscribe(
        (data) => {
          this.alertService.success('Settings saved successfully', {
            keepAfterRouteChange: true,
          });
          this.loading = false;
        },
        (error) => {
          this.alertService.error(error);
          this.loading = false;
        }
      );
  }

  get f() {
    return this.form.controls;
  }

  deleteQuestion() {
    // reset alerts on submit
    this.alertService.clear();

    const id = this.questionId;
    const question = this.questions.find((x) => x.id === id);
    question.isDeleting = true;
    this.questionsService
      .delete(id)
      .pipe(first())
      .subscribe(() => {
        this.questionDeleted = true;
        question.isDeleting = false;
        this.alertService.success('Question Deleted Successfully', {
          keepAfterRouteChange: true,
        });
        this.questionsService
          .getAll()
          .pipe(first())
          .subscribe((questions) => {
            this.questions = questions;
          });
      });
  }

  selectQuestion(id: string) {
    console.log('Select Question Called', id);
    this.questionId = id;
  }
}
