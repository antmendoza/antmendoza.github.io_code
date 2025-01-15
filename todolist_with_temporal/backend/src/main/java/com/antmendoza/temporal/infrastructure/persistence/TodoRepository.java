package com.antmendoza.temporal.infrastructure.persistence;

import com.antmendoza.temporal.domain.model.TodoList;
import com.antmendoza.temporal.domain.model.Todo;

import java.util.List;
import java.util.Optional;

public class TodoRepository {
  private final TodoList todoList;

  public TodoRepository(final TodoList todoList) {
    this.todoList = todoList;
  }

  public void save(Todo todo) {

    this.deleteById(todo.getId());
    todoList.add(todo);
  }

  public Optional<Todo> findById(String id) {
    return Optional.ofNullable(todoList.getById(id));
  }

  public List<Todo> getAll() {
    return todoList.getAll();
  }

  public Todo deleteById(String id) {
    return this.todoList.remove(id);
  }
}
