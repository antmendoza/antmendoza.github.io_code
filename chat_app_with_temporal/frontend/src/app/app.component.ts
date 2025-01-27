import {Component, inject, model} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import { MatDialogModule} from '@angular/material/dialog';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {MatNativeDateModule} from '@angular/material/core';


interface ITodo {
  id: string;
  title: string;
  dueDate?: string;
  done?: boolean;
  status?: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [HttpClientModule, MatButtonModule,
    MatFormFieldModule, MatIconModule,
    MatInputModule, MatCardModule,
    MatCheckboxModule, FormsModule,
    CommonModule, MatDialogModule,
    MatNativeDateModule,
  ]
})


export class AppComponent {


  //TODO: replace with your user id
  protected userId = "user_1"
  private url = 'http://localhost:3000/chats';

  constructor(private http: HttpClient) {

    this.startSession().subscribe((v) => {

      this.reloadChatList();

      //TODO
      setTimeout(() => {
        this.reloadChatList();
      }, 1000);


    });

  }



/////////////////////////// HTTP METHODS ///////////////////////////



  private reloadChatList() {
    return this.http.get<ITodo[]>(this.url+'/'+this.userId).subscribe((data: any) => {
      console.log(data);
    });
  }



  private startSession() {
    return this.http.post<void>(this.url+"/start-session/"+ this.userId,null);

  }



}
