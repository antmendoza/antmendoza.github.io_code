package com.antmendoza.temporal.domain;

import java.util.Objects;

public class Todo {
  private String id;
  private String title;
  private String dueDate;
  private TodoStatus status = TodoStatus.ACTIVE;

  public Todo() {}

  public Todo(String id, String title) {
    this.id = id;
    this.title = title;
  }

  public Todo(String id, String title, String dueDate) {
    this.id = id;
    this.title = title;
    this.dueDate = dueDate;
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

  public String getDueDate() {
    return dueDate;
  }

  public void setDueDate(final String dueDate) {
    this.dueDate = dueDate;
  }

  public TodoStatus getStatus() {
    return this.status;
  }

  public void setStatus(final TodoStatus status) {
    this.status = status;
  }

  @Override
  public boolean equals(final Object o) {
    if (o == null || getClass() != o.getClass()) return false;
    final Todo todo = (Todo) o;
    return Objects.equals(id, todo.id)
        && Objects.equals(title, todo.title)
        && Objects.equals(dueDate, todo.dueDate)
        && status == todo.status;
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, title, dueDate, status);
  }

  @Override
  public String toString() {
    return "Todo{"
        + "id='"
        + id
        + '\''
        + ", title='"
        + title
        + '\''
        + ", dueDate='"
        + dueDate
        + '\''
        + ", status="
        + status
        + '}';
  }
}
