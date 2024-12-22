package com.antmendoza.temporal.domain;

import java.time.Instant;

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
    updateStatusBasedOnDueDate();
  }

  public TodoStatus getStatus() {
    return this.status;
  }

  public void setStatus(final TodoStatus status) {
    this.status = status;
  }

  private void updateStatusBasedOnDueDate() {

    if (this.dueDate != null) {
      Instant dueDateInstant = Instant.parse(this.dueDate); // Parse the due date as an Instant
      Instant currentInstant = Instant.now(); // Get the current Instant
      if (dueDateInstant.isAfter(currentInstant)) {
        this.status = TodoStatus.ACTIVE;
      } else {
        this.status = TodoStatus.COMPLETED; // Or some other default status for past dates
      }
      return;
    }

    if (this.status != TodoStatus.COMPLETED) {
      this.status = TodoStatus.ACTIVE;
    }
  }
}
