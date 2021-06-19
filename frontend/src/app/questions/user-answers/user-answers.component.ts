import { first } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { QuestionsService } from '@app/_services/questions.service';
import { AnswersService } from '@app/_services/answers.service';
import { AlertService } from '@app/_services';
import { Answer } from '@app/_models/answer';

@Component({
  templateUrl: './user-answers.component.html',
})
export class UserAnswersComponent implements OnInit {
  questions = null;
  email;
  canTakeExam = false;
  passedCutoff = false;
  loading = false;
  userAnswers = {};

  constructor(
    private questionsService: QuestionsService,
    private answersService: AnswersService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.questionsService.getAll()
      .pipe(first())
      .subscribe(questions => {
        this.questions = questions;
        console.log(questions);
      });
  }

  submit() {
    this.answersService.submitAnswers(this.userAnswers)
      .pipe(first())
      .subscribe(
        data => {
          this.passedCutoff = data['passedCutoff'];
          if (this.passedCutoff) {
            this.alertService.success(`Passed`);
          } else {
            this.alertService.success(`Failed`);
          }
          this.loading = false;
          this.canTakeExam = false;
          this.email = '';
        },
        error => {
          this.alertService.error(`Error Submitting Answers. Try again later: ${error}`);
          this.loading = false;
        });
  }

  changed(id, answer, userAnswer) {
    const answerObject: Answer = {
      question_id: id,
      answer: userAnswer,
      is_correct: answer === userAnswer,
      email: this.email
    }

    this.userAnswers[id] = answerObject;
    console.log(this.userAnswers);
  }

  checkAvailability() {
    console.log('Check availability');

    this.loading = true;
    this.answersService.checkAvailability(this.email)
      .pipe(first())
      .subscribe(
        data => {
          this.canTakeExam = Boolean(data);
          if (!this.canTakeExam) {
            this.alertService.error(`You have already taken this test and your score recorded. If you wish to retake the test, please contact administrator`);
          }
          console.log(this.canTakeExam);
          this.loading = false;
        },
        error => {
          this.alertService.error(`Error checking user eligibility: ${error}`);
          this.loading = false;
        });
  }
}
