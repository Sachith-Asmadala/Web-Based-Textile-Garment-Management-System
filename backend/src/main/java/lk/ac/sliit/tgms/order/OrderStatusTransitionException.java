package lk.ac.sliit.tgms.order;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class OrderStatusTransitionException extends RuntimeException {

    private final Map<String, String> fields;

    public OrderStatusTransitionException(OrderStatus current, OrderStatus requested) {
        super(message(current, requested));
        this.fields = Map.of("status", fieldMessage(current));
    }

    public Map<String, String> fields() {
        return fields;
    }

    private static String message(OrderStatus current, OrderStatus requested) {
        return "Order status cannot move from " + current.name() + " to " + requested.name() + ".";
    }

    private static String fieldMessage(OrderStatus current) {
        List<OrderStatus> allowed = OrderStatusLifecycle.allowedTransitions(current);
        if (current == OrderStatus.READY_FOR_DELIVERY) {
            return "Order completion is synchronized by Delivery Management after the delivery is marked delivered.";
        }
        if (allowed.isEmpty()) {
            return "This order is in a terminal status and cannot be changed.";
        }
        return "Allowed next status: " + allowed.stream()
                .map(OrderStatus::name)
                .collect(Collectors.joining(" or ")) + ".";
    }
}
