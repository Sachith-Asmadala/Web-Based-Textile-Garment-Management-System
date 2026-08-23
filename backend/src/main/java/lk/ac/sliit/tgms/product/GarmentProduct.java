package lk.ac.sliit.tgms.product;

import java.time.Instant;

public record GarmentProduct(
        long id,
        long categoryId,
        String name,
        String description,
        ProductStatus status,
        Instant createdAt,
        Instant updatedAt) {}
