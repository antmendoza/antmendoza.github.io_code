package com.antmendoza.temporal.application.service;

import com.antmendoza.temporal.domain.model.Todo;
import com.antmendoza.temporal.domain.model.TodoStatus;
import com.antmendoza.temporal.domain.service.DateProvider;
import com.antmendoza.temporal.infrastructure.persistence.TimerRepository;
import com.antmendoza.temporal.infrastructure.persistence.TodoRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public class TodoService {

    private final TodoRepository todoRepository;
    private final TimerRepository timerRepository;
    private final DateProvider dateProvider;

    public TodoService(
            final TodoRepository todoRepository,
            final TimerRepository timerRepository,
            DateProvider dateProvider) {
        this.todoRepository = todoRepository;
        this.timerRepository = timerRepository;
        this.dateProvider = dateProvider;
    }

    public Todo save(final Todo todo) {
        this.updateStatusBasedOnDueDate(todo);
        saveTask(todo);
        updateTimer(todo);
        return todo;
    }


    public Optional<Todo> updateTodo(String id, String newTitle, String newDueDate) {
        Optional<Todo> optional = todoRepository.findById(id);
        optional.ifPresent(
                todo -> {
                    todo.setTitle(newTitle);

                    todo.setDueDate(newDueDate);

                    this.updateStatusBasedOnDueDate(todo);
                    saveTask(todo);
                    updateTimer(todo);
                });

        return optional;
    }

    public Optional<Todo> findTodo(String id) {
        return todoRepository.findById(id);
    }

    private void saveTask(final Todo todo) {
        todoRepository.save(todo);
    }

    private void updateTimer(final Todo todo) {
        timerRepository.createOrUpdate(
                todo,
                value -> {
                    this.updateStatusBasedOnDueDate(todo);
                    saveTask(todo);

                    return null;
                });
    }

    public List<Todo> getAll() {
        return todoRepository.getAll();
    }

    private void updateStatusBasedOnDueDate(Todo todo) {

        if (todo.getDueDate() != null) {

            final Instant dueDateInstant = Instant.parse(todo.getDueDate());
            final Instant currentInstant = Instant.ofEpochMilli(this.dateProvider.getCurrentMs());

            if (dueDateInstant.isAfter(currentInstant)) {
                todo.setStatus(TodoStatus.ACTIVE);
            } else {
                todo.setStatus(TodoStatus.EXPIRED);
            }
            return;
        }

        if (todo.getStatus() != TodoStatus.COMPLETED) {
            todo.setStatus(TodoStatus.ACTIVE);
        }
    }

    public void deleteTodo(final String id) {
        Todo deleted = this.todoRepository.deleteById(id);
        this.timerRepository.deleteTimer(deleted);
    }

    public void complete(final String id) {
        Optional<Todo> optional = todoRepository.findById(id);
        optional.ifPresent(
                todo -> {
                    todo.setStatus(TodoStatus.COMPLETED);
                    saveTask(todo);
                    this.timerRepository.deleteTimer(todo);
                });
    }


}
