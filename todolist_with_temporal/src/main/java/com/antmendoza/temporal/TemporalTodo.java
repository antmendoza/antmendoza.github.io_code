package com.antmendoza.temporal;

import com.antmendoza.temporal.domain.Todo;
import com.antmendoza.temporal.domain.TodoList;

import java.util.List;

public class TemporalTodo {

    private  TodoList todoList = new TodoList();

    public TemporalTodo() {
    }


    public void addTask(final Todo task) {

        todoList.addTask(task);
    }

    public List<Todo> getTasks() {
        return todoList.getTasks();
    }
}
