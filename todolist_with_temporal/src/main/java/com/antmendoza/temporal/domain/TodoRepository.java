package com.antmendoza.temporal.domain;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class TodoRepository {
  private final Map<String, Todo> tasks = new HashMap<>();

  public void save(Todo todo) {
    tasks.put(todo.getId(), todo);
  }

  public Optional<Todo> findById(String id) {
    return Optional.ofNullable(tasks.get(id));
  }

  public List<Todo> getAll() {
    return tasks.values().stream().toList();
  }

  public void deleteById(String id) {
    tasks.remove(id);
  }
}
