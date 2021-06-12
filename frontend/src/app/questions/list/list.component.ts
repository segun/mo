import { first } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { QuestionsService } from '@app/_services/questions.service';

@Component({
  templateUrl: './list.component.html',
})
export class ListComponent implements OnInit {
  questions = null;
  questionId;
  questionDeleted = false;

  constructor(private questionsService: QuestionsService) { }

  ngOnInit(): void {
    this.questionsService.getAll()
      .pipe(first())
      .subscribe(questions => {
        this.questions = questions;
      });
  }

  deleteQuestion() {
    const id = this.questionId;
    const question = this.questions.find(x => x.id === id);
    question.isDeleting = true;
    this.questionsService.delete(id)
      .pipe(first())
      .subscribe(() => {
        this.questionDeleted = true;
      });
  }

  selectQuestion(id: string) {
    console.log("Select Question Called", id);
    this.questionId = id;
  }
}
