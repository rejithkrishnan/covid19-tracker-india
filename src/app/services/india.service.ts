import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Patient } from './models/patient.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IndiaService {
  patients: Patient[] = [];
  constructor(public http: HttpClient) { }

  // async getPatients(): Promise<Patient[]> {
  //   await this.http.get('	https://api.covid19india.org/raw_data.json')
  //     .toPromise().then(async (data) => {
  //       this.patients = data['raw_data'];
  //     });
  //   return this.patients;
  // }



}
