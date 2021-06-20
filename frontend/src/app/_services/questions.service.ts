import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { Question, QuestionSettings } from '@app/_models/question';

@Injectable({
  providedIn: 'root'
})
export class QuestionsService {
  private questionSubject: BehaviorSubject<Question>;
  public question: Observable<Question>;

  constructor(private router: Router, private http: HttpClient) {
    this.questionSubject = new BehaviorSubject<Question>(JSON.parse(localStorage.getItem('question')));
    this.question = this.questionSubject.asObservable();
  }

  public get offenderValue(): Question {
    return this.questionSubject.value;
  }


  saveQuestionSettings(settings) {
    return this.http.post(`${environment.apiUrl}/questions/settings`, settings);    
  }

  getSettings() {
    return this.http.get<QuestionSettings[]>(`${environment.apiUrl}/questions/settings`);
  }

  getAll() {
    return this.http.get<Question[]>(`${environment.apiUrl}/questions`);
  }

  getById(id: string) {
    return this.http.get<Question>(`${environment.apiUrl}/questions/${id}`);
  }

  create(question: Question) {
    return this.http.post(`${environment.apiUrl}/questions/new`, question);
  }

  update(id, params) {
    return this.http.put(`${environment.apiUrl}/questions/${id}`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/questions/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }
}
