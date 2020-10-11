import { map } from 'rxjs/operators';
import { Offender } from '@app/_models/offender';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OffenderService {
  private offenderSubject: BehaviorSubject<Offender>;
  public offender: Observable<Offender>;

  constructor(private router: Router, private http: HttpClient) {
    this.offenderSubject = new BehaviorSubject<Offender>(JSON.parse(localStorage.getItem('offender')));
    this.offender = this.offenderSubject.asObservable();
  }

  public get offenderValue(): Offender {
    return this.offenderSubject.value;
  }

  getAll() {
    return this.http.get<Offender[]>(`${environment.apiUrl}/offenders`);
  }

  getById(id: string) {
    return this.http.get<Offender>(`${environment.apiUrl}/offenders/${id}`);
  }

  create(offender: Offender) {
    return this.http.post(`${environment.apiUrl}/offenders/new`, offender);
  }

  update(id, params) {
    return this.http.put(`${environment.apiUrl}/offenders/${id}`, params)
      .pipe(map(x => {
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/offenders/${id}`)
      .pipe(map(x => {
        return x;
      }));
  }
}
