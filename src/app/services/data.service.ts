import { Injectable } from '@angular/core';
import { IRank } from '../models/rank.model';
import { JsonData } from './json-data';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  getData(): IRank[] {
    return JsonData;
  }
}
