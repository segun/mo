import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { Answer } from '@app/_models/answer';

@Injectable({
  providedIn: 'root'
})
export class AnswersService {
  private answerSubject: BehaviorSubject<Answer>;
  public answer: Observable<Answer>;

  constructor(private router: Router, private http: HttpClient) {
    this.answerSubject = new BehaviorSubject<Answer>(JSON.parse(localStorage.getItem('answer')));
    this.answer = this.answerSubject.asObservable();
  }

  public get offenderValue(): Answer {
    return this.answerSubject.value;
  }

  
  submitAnswers(answers) {
    return this.http.post(`${environment.apiUrl}/answers/submit`, answers);
  }

  checkAvailability(email: string) {

    const data = {
      email: email
    }

    return this.http.get<Boolean>(`${environment.apiUrl}/answers/checkAvailability/${email}`);
  }
}
