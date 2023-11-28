import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

interface GuestResponse {
  name: {S: string},
  additional: {N: string}
}

export interface Guest {
  name: string,
  additional: string
}

@Injectable({
  providedIn: 'root'
})
export class GuestsService {
  
  private getEndpoint = 'https://mn14vzjiw7.execute-api.us-west-1.amazonaws.com/default/getGuests'
  private postEndpoint = 'https://2zh6ys6j75.execute-api.us-west-1.amazonaws.com/default/addGuest'

  constructor(private client: HttpClient ) { }

  addGuests(name: string, additional: number): Observable<any> {
    const payload = {
      name: {
        S: name
      },
      additional: {
        N: additional.toString()
      }
    }

    console.log(payload)

    return this.client.post(this.postEndpoint, payload);
  }

  getGuests(): Observable<Guest[]> {
    return this.client.get<GuestResponse[]>(this.getEndpoint).pipe(
      map(guests => guests.map<Guest>(g => {
        return {
          name: g.name.S, 
          additional: g.additional.N
        }
      }))
    )
  }


}
