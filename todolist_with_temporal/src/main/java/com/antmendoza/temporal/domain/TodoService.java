package com.antmendoza.temporal.domain;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public class TodoService {

  private final TodoRepository todoRepository;
  private final DateProvider dateProvider;

  public TodoService(final TodoRepository todoRepository, DateProvider dateProvider) {
    this.todoRepository = todoRepository;
    this.dateProvider = dateProvider;
  }

  public Optional<Todo> updateTodo(String id, String newTitle, String newDueDate) {
    Optional<Todo> optional = todoRepository.findById(id);
    optional.ifPresent(
        todo -> {
          todo.setTitle(newTitle);
          todo.setDueDate(newDueDate);

          this.updateStatusBasedOnDueDate(todo);
          todoRepository.save(todo);
        });
    return optional;
  }

  public Optional<Todo> findTodo(String id) {
    return todoRepository.findById(id);
  }

  public Todo save(final Todo todo) {
    this.updateStatusBasedOnDueDate(todo);
    todoRepository.save(todo);
    return todo;
  }

  public List<Todo> getAll() {
    return todoRepository.getAll();
  }

  private void updateStatusBasedOnDueDate(Todo todo) {

    if (todo.getDueDate() != null) {

      final Instant dueDateInstant = Instant.parse(todo.getDueDate());
      final Instant currentInstant = Instant.ofEpochMilli(this.dateProvider.getCurrentMs());

      if (dueDateInstant.isAfter(currentInstant)) {
        todo.setStatus(TodoStatus.ACTIVE);
      } else {
        todo.setStatus(TodoStatus.EXPIRED);
      }
      return;
    }

    if (todo.getStatus() != TodoStatus.COMPLETED) {
      todo.setStatus(TodoStatus.ACTIVE);
    }
  }
}
