package com.antmendoza.temporal.domain;

import com.antmendoza.temporal.domain.model.Todo;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.ArrayList;
import java.util.List;

public class TodoList {
  private List<Todo> todos = new ArrayList<>();

  public TodoList() {
  }


  public TodoList(List<Todo> todos) {
    this.todos = todos;
  }


  public void setTodos(final List<Todo> todos) {
    this.todos = todos;
  }

  public List<Todo> getTodos() {
    return todos;
  }

  public void add(final Todo todo) {
    this.todos.add(todo);
  }

  public Todo getById(final String id) {
    return todos.stream().filter(todo -> todo.getId().equals(id)).findFirst().orElse(null);
  }

  @JsonIgnore
  public List<Todo> getAll() {
    return new ArrayList<>(todos);
  }

  @JsonIgnore
  public Todo remove(final String id) {
    final Todo byId = this.getById(id);
    this.todos.remove(byId);
    return byId;
  }
}
