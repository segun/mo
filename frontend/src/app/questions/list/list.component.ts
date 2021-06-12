import { first } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { QuestionsService } from '@app/_services/questions.service';

@Component({
  templateUrl: './list.component.html',
})
export class ListComponent implements OnInit {
  questions = null;

  constructor(private questionsService: QuestionsService) { }

  ngOnInit(): void {
    this.questionsService.getAll()
      .pipe(first())
      .subscribe(questions => {
        this.questions = questions;        
      });
  }
}
