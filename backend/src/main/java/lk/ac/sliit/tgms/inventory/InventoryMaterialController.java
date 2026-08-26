package lk.ac.sliit.tgms.inventory;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.net.URI;
import java.time.Instant;
import java.util.List;
import lk.ac.sliit.tgms.authorization.RoleGuards.InventoryManagerOnly;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventory-materials")
public class InventoryMaterialController {

    private final InventoryMaterialService inventoryMaterialService;

    public InventoryMaterialController(InventoryMaterialService inventoryMaterialService) {
        this.inventoryMaterialService = inventoryMaterialService;
    }

    @PostMapping
    @InventoryManagerOnly
    public ResponseEntity<CreateInventoryMaterialResponse> create(
            @Valid @RequestBody CreateInventoryMaterialRequest request) {
        InventoryMaterial material = inventoryMaterialService.createMaterial(
                request.sourceMaterialSupplyId(),
                request.materialCode(),
                request.materialName(),
                request.materialDescription(),
                request.materialType(),
                request.unitOfMeasure(),
                request.currentQuantity(),
                request.lowStockThreshold());
        InventoryMaterialResponse response = InventoryMaterialResponse.from(material);
        return ResponseEntity.created(URI.create("/api/inventory-materials/" + response.id()))
                .body(new CreateInventoryMaterialResponse(
                        "Inventory material created successfully.", response));
    }

    @GetMapping
    @InventoryManagerOnly
    public InventoryMaterialListResponse list() {
        return new InventoryMaterialListResponse(inventoryMaterialService.getMaterials()
                .stream()
                .map(InventoryMaterialResponse::from)
                .toList());
    }

    public record CreateInventoryMaterialRequest(
            @Positive(message = "Source material supply ID must be a positive number.")
                    Long sourceMaterialSupplyId,
            @NotBlank(message = "Material code is required.")
                    @Size(max = 64, message = "Material code must not exceed 64 characters.")
                    String materialCode,
            @NotBlank(message = "Material name is required.")
                    @Size(max = 160, message = "Material name must not exceed 160 characters.")
                    String materialName,
            @Size(max = 500, message = "Description must not exceed 500 characters.")
                    String materialDescription,
            @NotNull(message = "Material type is required.")
                    InventoryMaterialType materialType,
            @NotBlank(message = "Unit of measure is required.")
                    @Size(max = 32, message = "Unit of measure must not exceed 32 characters.")
                    String unitOfMeasure,
            @NotNull(message = "Opening quantity is required.")
                    @DecimalMin(value = "0.001", message = "Opening quantity must be greater than zero.")
                    @Digits(
                            integer = 11,
                            fraction = 3,
                            message = "Opening quantity must have at most 11 digits and 3 decimals.")
                    BigDecimal currentQuantity,
            @NotNull(message = "Low-stock threshold is required.")
                    @DecimalMin(value = "0.00", message = "Low-stock threshold cannot be negative.")
                    @Digits(
                            integer = 11,
                            fraction = 3,
                            message = "Low-stock threshold must have at most 11 digits and 3 decimals.")
                    BigDecimal lowStockThreshold) {}

    public record CreateInventoryMaterialResponse(
            String message, InventoryMaterialResponse material) {}

    public record InventoryMaterialListResponse(List<InventoryMaterialResponse> materials) {}

    public record InventoryMaterialResponse(
            long id,
            Long sourceMaterialSupplyId,
            String materialCode,
            String materialName,
            String materialDescription,
            InventoryMaterialType materialType,
            String unitOfMeasure,
            String currentQuantity,
            String lowStockThreshold,
            InventoryMaterialStatus status,
            Instant createdAt,
            Instant updatedAt) {

        static InventoryMaterialResponse from(InventoryMaterial material) {
            return new InventoryMaterialResponse(
                    material.id(),
                    material.sourceMaterialSupplyId(),
                    material.materialCode(),
                    material.materialName(),
                    material.materialDescription(),
                    material.materialType(),
                    material.unitOfMeasure(),
                    material.currentQuantity().toPlainString(),
                    material.lowStockThreshold().toPlainString(),
                    material.status(),
                    material.createdAt(),
                    material.updatedAt());
        }
    }
}
