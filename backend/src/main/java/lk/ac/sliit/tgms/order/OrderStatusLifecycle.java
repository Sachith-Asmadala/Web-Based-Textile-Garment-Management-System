package lk.ac.sliit.tgms.order;

import java.util.List;

/**
 * TGMS-46 central order lifecycle policy. Future Production/Delivery integrations must
 * call the Order service rather than updating orders.status directly.
 */
public final class OrderStatusLifecycle {

    private OrderStatusLifecycle() {}

    public static List<OrderStatus> allowedTransitions(OrderStatus current) {
        return switch (current) {
            case PENDING -> List.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED);
            case CONFIRMED -> List.of(OrderStatus.IN_PRODUCTION, OrderStatus.CANCELLED);
            case IN_PRODUCTION -> List.of(OrderStatus.READY_FOR_DELIVERY);
            case READY_FOR_DELIVERY, COMPLETED, CANCELLED -> List.of();
        };
    }

    public static boolean canTransition(OrderStatus current, OrderStatus requested) {
        return allowedTransitions(current).contains(requested);
    }
}
