package com.antmendoza.temporal.domain;

public class TodoRequest {

  private String id;
  private String description;
  private String dueDate;

  public TodoRequest() {}

  public TodoRequest(String id, String description, String dueDate) {
    this.id = id;
    this.description = description;
    this.dueDate = dueDate;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
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
