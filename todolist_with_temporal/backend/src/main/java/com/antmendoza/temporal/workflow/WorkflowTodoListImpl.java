package com.antmendoza.temporal.workflow;

import com.antmendoza.temporal.domain.*;
import io.temporal.workflow.Workflow;
import io.temporal.workflow.WorkflowInit;
import java.util.List;
import org.slf4j.Logger;


public class WorkflowTodoListImpl implements WorkflowTodoList {

  private final Logger logger = Workflow.getLogger(WorkflowTodoListImpl.class.getName());

  private final TodoService todoService;

  @WorkflowInit
  public WorkflowTodoListImpl(TodoList todoList) {
    final DateProvider dateProvider = Workflow::currentTimeMillis;
    this.todoService =
        new TodoService(new TodoRepository(todoList),
                new TimerRepository(),
                dateProvider);
  }

  @Override
  public void run(TodoList todoList) {

    //recreate the in-memory todo list, including the timer for each item
    todoList.getAll().forEach(t ->
            this.todoService.updateTodo(t.getId(), t.getTitle(), t.getDueDate())
    );

    Workflow.await(
        () -> Workflow.getInfo().isContinueAsNewSuggested()
                //Workflow.getInfo().getHistoryLength() > 20
                && Workflow.isEveryHandlerFinished());

    Workflow.continueAsNew(new TodoList(this.todoService.getAll()));

  }

  @Override
  public void addTodo(final TodoRequest todoRequest) {
    final Todo todo =
        new Todo(todoRequest.getId(), todoRequest.getTitle(), todoRequest.getDueDate());
    this.todoService.save(todo);
  }

  @Override
  public void updateTodo(final TodoRequest todoRequest) {
    this.todoService.updateTodo(
        todoRequest.getId(), todoRequest.getTitle(), todoRequest.getDueDate());
  }

  @Override
  public void completeTodo(final String id) {
    this.todoService.complete(id);
  }


  @Override
  public void deleteTodo(final String id) {
    this.todoService.deleteTodo(id);
  }

  @Override
  public List<Todo> getTodos() {
    return this.todoService.getAll();
  }
}
