package com.antmendoza.temporal.infrastructure.workflow;

import com.antmendoza.temporal.domain.model.TodoList;
import com.antmendoza.temporal.domain.service.DateProvider;
import com.antmendoza.temporal.application.service.TodoService;
import com.antmendoza.temporal.application.service.WorkflowTodoList;
import com.antmendoza.temporal.domain.model.Todo;
import com.antmendoza.temporal.infrastructure.logging.LoggerFactory;
import com.antmendoza.temporal.infrastructure.persistence.TimerRepository;
import com.antmendoza.temporal.infrastructure.persistence.TodoRepository;
import com.antmendoza.temporal.presentation.dto.TodoRequest;
import io.temporal.workflow.Workflow;
import io.temporal.workflow.WorkflowInit;
import java.util.List;
import org.slf4j.Logger;


public class WorkflowTodoListImpl implements WorkflowTodoList {

  private final Logger logger = LoggerFactory.getLogger(WorkflowTodoListImpl.class);

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

    //recreate the in-memory to-do list, including the timer for each item
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

    logger.info("Adding todo: {}", todoRequest);
    final Todo todo =
        new Todo(todoRequest.getId(), todoRequest.getTitle(), todoRequest.getDueDate());
    this.todoService.save(todo);
  }

  @Override
  public void updateTodo(final TodoRequest todoRequest) {

    logger.info("Updating todo: {}", todoRequest);

    this.todoService.updateTodo(
        todoRequest.getId(), todoRequest.getTitle(), todoRequest.getDueDate());
  }

  @Override
  public void completeTodo(final String id) {
    logger.info("Completing todo: {}", id);

    this.todoService.complete(id);
  }


  @Override
  public void deleteTodo(final String id) {
    logger.info("Deleting todo: {}", id);
    this.todoService.deleteTodo(id);
  }

  @Override
  public List<Todo> getTodos() {
    return this.todoService.getAll();
  }
}
