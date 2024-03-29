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
  dateStarted = 0;
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
  showBody = true;
  uploadedFiles: Array<File>;

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
      reason: ['', Validators.required],
      courtOrder: [''],
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

  fileChange(element) {
    this.uploadedFiles = element.target.files;

    let formData = new FormData();
    for (var i = 0; i < this.uploadedFiles.length; i++) {
      formData.append(
        'uploads[]',
        this.uploadedFiles[i],
        this.uploadedFiles[i].name
      );
      formData.append("email", this.f.email.value);
    }

    this.answersService.uploadFile(formData).subscribe((data) => {console.log("uploaded: ", data)});
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
            // do nothing
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
    this.showBody = false;
    this.answersService
      .checkAvailability(this.email)
      .pipe(first())
      .subscribe(
        (data) => {
          this.canTakeExam = Boolean(data.canTakeExam);
          this.dateStarted = +data.dateStarted;
          this.requiredTime =
            this.dateStarted <= 0
              ? this.requiredTime
              : this.requiredTime - (new Date().getTime() - this.dateStarted);
          console.log(this.requiredTime);
          if (!this.canTakeExam) {
            this.alertService.error(
              `You have already taken this test and your score recorded. Please contact MASEP at ${this.adminPhonenumber}`
            );
          } else {
            this.f.email.setValue(this.email);
            this.startExam();
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

  startExam() {
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
