import {Component, inject, model} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxChange, MatCheckboxModule} from '@angular/material/checkbox';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {ConfirmationComponent} from './confirmation/confirmation.component';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {Observable} from 'rxjs';
import {MatDatepicker, MatDatepickerInput} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatTimepicker, MatTimepickerInput} from '@angular/material/timepicker';


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
    MatDatepicker, MatDatepickerInput,
    MatNativeDateModule, MatTimepickerInput, MatTimepicker
  ]
})


export class AppComponent {

  private url = 'http://localhost:3030/todos';

  public todoList: ITodo[] = [];
  public title = model('');
  public dueDate = model('');

  readonly dialog = inject(MatDialog);

  selectedIndex: number = -1;

  constructor(private http: HttpClient) {
    this.reloadTodoList();
    setInterval(()=> { this.reloadTodoList() }, 5 * 1000);
  }

  /////////////////////////// UI METHODS ///////////////////////////


  public save(): void {

    const todoId = (Math.random() + new Date().getMilliseconds())+"";

    const obj: ITodo = {
      id: todoId,
      title: this.title(),
      dueDate: this.getDueDateValue()
    };

    this.resetFormFields();

    this.saveTodo(obj).subscribe(() => {
      this.reloadTodoList();
    });

  }


  editItem(index: number, item: ITodo): void {
    this.selectedIndex = index;
    this.title.set(item.title);
    if (item.dueDate != null) {
      this.dueDate.set(item.dueDate);
    }

  }

  updateItem() {
    if (this.selectedIndex >= 0) {

      const updatedItem = this.todoList[this.selectedIndex];
      updatedItem.title = this.title();
      updatedItem.dueDate = this.getDueDateValue();

      this.resetFormFields();

      this.updateTodo(updatedItem).subscribe(() => {
        this.reloadTodoList();
      });

    }
  }

  deleteConfirmation(index: number): void {
    this.dialog.open(ConfirmationComponent, {
      width: '250px'
    }).afterClosed().subscribe((res: any) => {
      if (res === 'YES') {

        let iTodo = this.todoList[index];
        this.deleteTodo(iTodo).subscribe(() => {
          this.reloadTodoList();
        });

        this.resetFormFields();

      }
    });
  }

  markAsCompleted(e: any, index: number): void {

    let todo = this.todoList[index];
    const marked  = e.srcElement.checked;

    if(marked){

      this.completeTodo(todo).subscribe(() => {
        this.reloadTodoList();
      });

    }

  }
  public reset(): void {
    this.resetFormFields();
  }

  public cssClassItem(item: ITodo) {

    if(this.isCompleted(item)){
      return "";
    }

    if(item.dueDate != null && new Date(item.dueDate) < new Date()){
      return "overdue";
    }
    return "";
  }

  public isCompleted(item: ITodo) {
    return item.status === 'COMPLETED';
  }

  public hasDueDate(item: ITodo) {
    return item.dueDate != null;
  }


/////////////////////////// HTTP METHODS ///////////////////////////



  private reloadTodoList() {
    this.getTodos().subscribe((data: ITodo[]) => {
      this.todoList = data
    });
  }

  private getTodos(): Observable<ITodo[]> {
    return this.http.get<ITodo[]>(this.url);
  }


  private saveTodo(obj: ITodo): Observable<void> {
    return this.http.post<void>(this.url, obj);
  }


  private updateTodo(obj: ITodo): Observable<void> {
    return this.http.put<void>(this.url+"/"+obj.id, obj);
  }


  private deleteTodo(obj: ITodo): Observable<void> {
    return this.http.delete<void>(this.url+"/"+obj.id);
  }


  private completeTodo(obj: ITodo): Observable<void> {
    return this.http.put<void>(this.url+"/"+obj.id+"/complete",null);
  }



  /////////////////////////// HELPER METHODS ///////////////////////////


  private resetFormFields() {
    this.title.set('');
    this.dueDate.set('');
    this.selectedIndex = -1;
  }


  private getDueDateValue() {
    let dueDateValue = undefined;
    if (this.dueDate() && !isNaN(new Date(this.dueDate()).getTime())) {
      dueDateValue = new Date(this.dueDate()).toISOString();
    }
    return dueDateValue;
  }


  setDate() {
    let newDate = new Date();
    newDate.setMinutes(newDate.getMinutes() + 1);
    newDate.setSeconds(0);
    this.dueDate.set(newDate.toISOString());
  }
}
