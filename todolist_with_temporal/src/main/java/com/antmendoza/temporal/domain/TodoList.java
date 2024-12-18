package com.antmendoza.temporal.domain;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class TodoList {

  private List<Todo> todos = new ArrayList<>();

  public TodoList() {}

  public List<Todo> getTasks() {
    return todos;
  }

  public void setTasks(final List<Todo> todos) {
    this.todos = todos;
  }

  public void addTask(final Todo todo) {

    final Optional<Todo> containsTask =
        this.todos.stream().filter(t -> t.getId().equals(todo.getId())).findFirst();

    containsTask.ifPresent(value -> todos.remove(value));

    this.todos.add(todo);
  }
}
