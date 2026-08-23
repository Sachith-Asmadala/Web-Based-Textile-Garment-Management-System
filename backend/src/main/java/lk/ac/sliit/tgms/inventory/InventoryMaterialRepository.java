package lk.ac.sliit.tgms.inventory;

import java.math.BigDecimal;
import java.util.Optional;

public interface InventoryMaterialRepository {

    long create(
            Long sourceMaterialSupplyId,
            String materialCode,
            String materialName,
            String materialDescription,
            InventoryMaterialType materialType,
            String unitOfMeasure,
            BigDecimal currentQuantity,
            BigDecimal lowStockThreshold);

    Optional<InventoryMaterial> findById(long materialId);

    Optional<InventoryMaterial> findByMaterialCode(String materialCode);
}
