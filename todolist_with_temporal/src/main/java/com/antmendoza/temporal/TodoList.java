package com.antmendoza.temporal;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class TodoList {

  private List<Task> tasks = new ArrayList<>();

  public TodoList() {}

  public List<Task> getTasks() {
    return tasks;
  }

  public void setTasks(final List<Task> tasks) {
    this.tasks = tasks;
  }

  public void addTask(final Task task) {

    final Optional<Task> containsTask =
        this.tasks.stream().filter(t -> t.getId().equals(task.getId())).findFirst();

    containsTask.ifPresent(value -> tasks.remove(value));

    this.tasks.add(task);
  }
}
