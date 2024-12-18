package com.antmendoza.temporal;

import java.util.Objects;

public class Task {
  private String id;
  private String title;

  public Task() {}

  public Task(String id, String title) {
    this.id = id;
    this.title = title;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(final String title) {
    this.title = title;
  }

  public String getId() {
    return id;
  }

  public void setId(final String id) {
    this.id = id;
  }

  @Override
  public boolean equals(final Object o) {
    if (o == null || getClass() != o.getClass()) return false;
    final Task task = (Task) o;
    return Objects.equals(id, task.id) && Objects.equals(title, task.title);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, title);
  }
}
