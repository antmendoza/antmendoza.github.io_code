package com.antmendoza.temporal.presentation.dto;

public class TodoRequest {

  private String id;
  private String title;
  private String dueDate;

  public TodoRequest() {}

  public TodoRequest(String id, String title, String dueDate) {
    this.id = id;
    this.title = title;
    this.dueDate = dueDate;
  }

  public TodoRequest(String id, String title) {
    this(id, title, null);
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getDueDate() {
    return dueDate;
  }

  public void setDueDate(final String dueDate) {
    this.dueDate = dueDate;
  }

  public String getId() {
    return id;
  }

  public void setId(final String id) {
    this.id = id;
  }
}
