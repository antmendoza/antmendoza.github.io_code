package com.antmendoza.temporal.domain;

import java.util.List;
import java.util.Optional;

public class TodoService {

  private final TodoRepository todoRepository;

  public TodoService(final TodoRepository todoRepository) {
    this.todoRepository = todoRepository;
  }

  public Optional<Todo> updateTodo(String id, String newTitle, String newDueDate) {
    Optional<Todo> taskOptional = todoRepository.findById(id);
    taskOptional.ifPresent(
        task -> {
          if (newTitle != null) {
            task.setTitle(newTitle);
          }
          if (newDueDate != null) {
            task.setDueDate(newDueDate);
          }
          todoRepository.save(task);
        });
    return taskOptional;
  }

  public Optional<Todo> findTodo(String id) {
    return todoRepository.findById(id);
  }

  public Todo save(final Todo todo) {
    todoRepository.save(todo);
    return todo;
  }

  public List<Todo> getAll() {
    return todoRepository.getAll();
  }
}
