package com.antmendoza.temporal.domain;

import io.temporal.failure.CanceledFailure;
import io.temporal.workflow.CancellationScope;
import io.temporal.workflow.TimerOptions;
import io.temporal.workflow.Workflow;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;

public class TimerRepository {

    private static final Logger logger = LoggerFactory.getLogger(TimerRepository.class);
    private final Map<String, TimerData> timers = new HashMap<>();

    public void createOrUpdate(Todo todo, Function<Todo, Void> onTimerFire) {

        createOrUpdateTimer(todo, onTimerFire);
    }



    public void deleteTimer(Todo todo) {
        logger.info("deleteTimer {} ", todo);
        TimerData timerData = timers.get(todo.getId());

        cancelTimer(todo, timerData);


    }

    private void cancelTimer(final Todo todo, final TimerData timerData) {
        if (timerData != null && timerData.cancelableScope() != null) {
            timerData.cancelableScope().cancel();
            timers.remove(todo.getId());
        }
    }

    private void createOrUpdateTimer(final Todo todo, Function<Todo, Void> onTimerFire) {

        logger.info("updateOrCreateTimer {} ", todo);
        TimerData timerData = timers.get(todo.getId());

        logger.info("timerData {} ", timerData);


        if (timerData != null && Objects.equals(timerData.todo().getDueDate(), todo.getDueDate())) {
            return;
        }


        cancelTimer(todo, timerData);

        if (todo.getDueDate() != null) {

            CancellationScope cancelableScope = createAndRunTimer(todo, onTimerFire);

            timers.put(todo.getId(), new TimerData(todo.clone(), cancelableScope));

        }
    }

    private CancellationScope createAndRunTimer(final Todo todo, final Function<Todo, Void> onTimerFire) {
        CancellationScope cancelableScope =
                Workflow.newCancellationScope(
                        () -> {
                            final Duration delay =
                                    Duration.ofMillis(
                                            Instant.parse(todo.getDueDate()).toEpochMilli()
                                                    - Instant.ofEpochMilli(Workflow.currentTimeMillis()).toEpochMilli());

                            final String timerSummary = "TodId: " + todo.getId();
                            final TimerOptions timerOptions = TimerOptions.newBuilder().setSummary(timerSummary).build();
                            Workflow.newTimer(delay, timerOptions)
                                    .handle(
                                            (value, exception) -> {
                                                logger.info("Handle cancellation scope {}", todo);

                                                if (exception instanceof CanceledFailure) {
                                                    logger.info("Timer cancelled {}", todo);
                                                    return null;
                                                }

                                                logger.info("Timer fired {}", todo);

                                                onTimerFire.apply(todo);

                                                timers.remove(todo.getId());
                                                return value;
                                            });
                        });

        cancelableScope.run();
        return cancelableScope;
    }

    private record TimerData(Todo todo, CancellationScope cancelableScope) {


    }
}
