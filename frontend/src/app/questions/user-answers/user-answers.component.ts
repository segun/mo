import { first } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { QuestionsService } from '@app/_services/questions.service';
import { AnswersService } from '@app/_services/answers.service';
import { AlertService } from '@app/_services';
import { Answer } from '@app/_models/answer';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  templateUrl: './user-answers.component.html',
})
export class UserAnswersComponent implements OnInit {
  questions = null;
  email;
  canTakeExam = false;
  passedCutoff = false;
  loading = false;
  adminPhonenumber = '0000-0000-0000';
  userAnswers = {};
  form: FormGroup;
  submitted = false;
  hour = '00';
  min = '00';
  sec = '00';
  requiredTime = 0;
  duration = '';
  timerClass = 'btn btn-success';
  testStarted = false;

  constructor(
    private questionsService: QuestionsService,
    private answersService: AnswersService,
    private alertService: AlertService,
    private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({
      email: ['', Validators.email],
      phoneNumber: ['', Validators.required],
      fullName: ['', Validators.required],
    });

    this.questionsService
      .getSettings()
      .pipe(first())
      .subscribe((questionSettings) => {
        questionSettings.forEach((qs) => {
          console.log(qs);
          if (qs.name === 'admin_phone_number') {
            this.adminPhonenumber = qs.value;
          }

          if (qs.name === 'time_required') {
            this.duration = qs.value;
            this.requiredTime = +qs.value * 1000 * 60;
          }
        });
      });
  }

  ngOnInit(): void {
    this.questionsService
      .getAll()
      .pipe(first())
      .subscribe((questions) => {
        this.questions = questions;
        console.log(questions);
      });

    this.questionsService
      .getSettings()
      .pipe(first())
      .subscribe((questionSettings) => {
        questionSettings.forEach((qs) => {
          console.log(qs);
          if (qs.name === 'admin_phone_number') {
            this.adminPhonenumber = qs.value;
          }

          if (qs.name === 'time_required') {
            this.duration = qs.value;
            this.requiredTime = +qs.value * 1000 * 60;
          }
        });
      });
  }

  get f() {
    return this.form.controls;
  }

  onContactFormSubmit() {
    console.log('Contact Form Submitting');
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.loading = true;

    this.answersService
      .submitContactForm(this.form.value)
      .pipe(first())
      .subscribe(
        (data) => {
          this.alertService.success(
            'Your information was submitted successfully',
            { keepAfterRouteChange: true }
          );
          this.canTakeExam = false;
          this.passedCutoff = false;
          this.loading = false;
        },
        (error) => {
          this.alertService.error(error);
          this.loading = false;
        }
      );
  }

  submit() {
    for (let question of this.questions) {
      const answerObject = this.userAnswers[question.id];
      if (!answerObject) {
        const answerObject: Answer = {
          question_id: question.id,
          answer: '',
          is_correct: false,
          email: this.email,
          points: question.points,
        };

        this.userAnswers[question.id] = answerObject;
        console.log(this.userAnswers);
      }
    }
    this.alertService.clear();
    this.answersService
      .submitAnswers(this.userAnswers)
      .pipe(first())
      .subscribe(
        (data) => {
          this.canTakeExam = false;
          this.passedCutoff = data['passedCutoff'];
          if (this.passedCutoff) {
            this.alertService.success(
              `You met the criteria for online classes. If you are interested, please fill out the contact form below. We will be in touch`
            );
          } else {
            this.alertService.error(
              `You are ineligible to take MASEP Online. If you are in the state of Mississippi, please see your court order for further instruction on where to attend MASEP in person. If you are out of state, please contact MASEP at 662-325-3423`
            );
          }
          this.loading = false;
          this.email = '';
        },
        (error) => {
          this.alertService.error(
            `Error Submitting Answers. Try again later: ${error}`
          );
          this.loading = false;
        }
      );
  }

  changed(question, userAnswer) {
    const answerObject: Answer = {
      question_id: question.id,
      answer: userAnswer,
      is_correct: question.answer === userAnswer,
      email: this.email,
      points: question.points,
    };

    this.userAnswers[question.id] = answerObject;
    console.log(this.userAnswers);
  }

  validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  checkAvailability() {
    this.alertService.clear();
    this.passedCutoff = false;

    console.log('Check availability');

    if (!this.validateEmail(this.email)) {
      alert('Please enter a valid email address');
      return;
    }
    this.loading = true;
    this.answersService
      .checkAvailability(this.email)
      .pipe(first())
      .subscribe(
        (data) => {
          this.canTakeExam = Boolean(data);
          if (!this.canTakeExam) {
            this.alertService.error(
              `You have already taken this test and your score recorded. Please contact MASEP at ${this.adminPhonenumber}`
            );
          } else {
            this.f.email.setValue(this.email);
            const timerInterval = setInterval(() => {
              this.requiredTime -= 900;
              if (this.requiredTime < 0 && this.testStarted) {
                alert('You time is up. Click ok to submit your answers');
                this.submit();
                this.testStarted = false;
                clearInterval(timerInterval);
              }
              this.displayTime();
            }, 900);
          }

          console.log(this.canTakeExam);
          this.loading = false;
        },
        (error) => {
          this.alertService.error(`Error checking user eligibility: ${error}`);
          this.loading = false;
        }
      );
  }

  displayTime() {
    const hours = Math.floor(this.requiredTime / 60 / 60 / 1000);
    const mins = Math.floor(this.requiredTime / 60 / 1000);
    const millis = (this.requiredTime / 60) % 1000;
    const secs = Math.floor((millis / 1000) * 60);
    this.hour = hours < 10 ? '0' + hours : hours + '';
    this.min = mins < 10 ? '0' + mins : mins + '';
    this.sec = secs < 10 ? '0' + secs : secs + '';

    const fiveMinutes = 5 * 60 * 1000;
    if (this.requiredTime <= fiveMinutes) {
      this.timerClass = 'btn btn-danger';
    }
    this.testStarted = true;
  }
}
