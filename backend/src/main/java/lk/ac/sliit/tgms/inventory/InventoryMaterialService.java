package lk.ac.sliit.tgms.inventory;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryMaterialService {

    private final InventoryMaterialRepository inventoryMaterialRepository;

    public InventoryMaterialService(InventoryMaterialRepository inventoryMaterialRepository) {
        this.inventoryMaterialRepository = inventoryMaterialRepository;
    }

    @Transactional
    public InventoryMaterial createMaterial(
            Long sourceMaterialSupplyId,
            String materialCode,
            String materialName,
            String materialDescription,
            InventoryMaterialType materialType,
            String unitOfMeasure,
            BigDecimal currentQuantity,
            BigDecimal lowStockThreshold) {
        validateSourceMaterialSupplyId(sourceMaterialSupplyId);
        String normalizedCode = normalizeRequiredText(materialCode);
        String normalizedName = normalizeRequiredText(materialName);
        String normalizedDescription = normalizeOptionalText(materialDescription);
        String normalizedUnit = normalizeRequiredText(unitOfMeasure);
        validate(
                normalizedCode,
                normalizedName,
                normalizedDescription,
                materialType,
                normalizedUnit,
                currentQuantity,
                lowStockThreshold);

        long materialId = inventoryMaterialRepository.create(
                sourceMaterialSupplyId,
                normalizedCode,
                normalizedName,
                normalizedDescription,
                materialType,
                normalizedUnit,
                currentQuantity,
                lowStockThreshold);
        return inventoryMaterialRepository.findById(materialId)
                .orElseThrow(() -> new IllegalStateException(
                        "Created inventory material could not be read back."));
    }

    @Transactional(readOnly = true)
    public InventoryMaterial requireMaterial(long materialId) {
        if (materialId <= 0) {
            throw new InventoryMaterialValidationException(
                    Map.of("materialId", "Material ID must be a positive number."));
        }
        return inventoryMaterialRepository.findById(materialId)
                .orElseThrow(() -> new InventoryMaterialValidationException(
                        Map.of("materialId", "Inventory material was not found.")));
    }

    private void validateSourceMaterialSupplyId(Long sourceMaterialSupplyId) {
        if (sourceMaterialSupplyId != null && sourceMaterialSupplyId <= 0) {
            throw new InventoryMaterialValidationException(Map.of(
                    "sourceMaterialSupplyId",
                    "Source material supply ID must be a positive number when provided."));
        }
    }

    private void validate(
            String materialCode,
            String materialName,
            String materialDescription,
            InventoryMaterialType materialType,
            String unitOfMeasure,
            BigDecimal currentQuantity,
            BigDecimal lowStockThreshold) {
        Map<String, String> fields = new LinkedHashMap<>();
        validateRequiredText(fields, "materialCode", materialCode, 64, "Material code");
        validateRequiredText(fields, "materialName", materialName, 160, "Material name");
        validateOptionalText(
                fields, "materialDescription", materialDescription, 500, "Description");
        if (materialType == null) {
            fields.put("materialType", "Material type is required.");
        }
        validateRequiredText(fields, "unitOfMeasure", unitOfMeasure, 32, "Unit of measure");
        validateNonNegativeDecimal(fields, "currentQuantity", currentQuantity, 11, 3,
                "Current quantity");
        validateNonNegativeDecimal(fields, "lowStockThreshold", lowStockThreshold, 11, 3,
                "Low-stock threshold");
        if (!fields.isEmpty()) {
            throw new InventoryMaterialValidationException(fields);
        }
    }

    private String normalizeRequiredText(String value) {
        return value == null ? "" : normalizeText(value);
    }

    private String normalizeOptionalText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return normalizeText(value);
    }

    private String normalizeText(String value) {
        return Normalizer.normalize(value.trim(), Normalizer.Form.NFKC)
                .replaceAll("\\s+", " ");
    }

    private void validateRequiredText(
            Map<String, String> fields,
            String field,
            String value,
            int maxLength,
            String label) {
        if (value.isBlank()) {
            fields.put(field, label + " is required.");
        } else if (value.length() > maxLength) {
            fields.put(field, label + " must be " + maxLength + " characters or fewer.");
        }
    }

    private void validateOptionalText(
            Map<String, String> fields,
            String field,
            String value,
            int maxLength,
            String label) {
        if (value != null && value.length() > maxLength) {
            fields.put(field, label + " must be " + maxLength + " characters or fewer.");
        }
    }

    private void validateNonNegativeDecimal(
            Map<String, String> fields,
            String field,
            BigDecimal value,
            int integerDigits,
            int scale,
            String label) {
        if (value == null) {
            fields.put(field, label + " is required.");
            return;
        }
        if (value.signum() < 0) {
            fields.put(field, label + " cannot be negative.");
            return;
        }
        if (value.scale() > scale || value.precision() - value.scale() > integerDigits) {
            fields.put(field, label + " must fit " + integerDigits
                    + " digits and " + scale + " decimal places.");
        }
    }
}
