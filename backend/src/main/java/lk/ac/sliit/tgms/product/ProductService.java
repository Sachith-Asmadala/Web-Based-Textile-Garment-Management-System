package lk.ac.sliit.tgms.product;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional
    public GarmentProductDetails createProduct(
            String name,
            String categoryName,
            String size,
            String color,
            BigDecimal price,
            CreateProductAvailability availability) {
        String normalizedName = normalizeText(name);
        String normalizedCategory = normalizeText(categoryName);
        String normalizedSize = normalizeText(size);
        String normalizedColor = normalizeText(color);
        validate(
                normalizedName,
                normalizedCategory,
                normalizedSize,
                normalizedColor,
                price,
                availability);

        ProductCategory category = findOrCreateCategory(normalizedCategory);
        if (category.status() != CategoryStatus.ACTIVE) {
            throw new InactiveProductCategoryException();
        }

        long productId = productRepository.createProduct(category.id(), normalizedName);
        productRepository.createVariant(
                productId,
                normalizedSize,
                normalizedColor,
                price,
                availability.toVariantStatus());

        return productRepository.findProductById(productId)
                .orElseThrow(() -> new IllegalStateException(
                        "Created garment product could not be read back."));
    }

    @Transactional
    public GarmentProductDetails updateProduct(
            long productId,
            long variantId,
            String name,
            String categoryName,
            String size,
            String color,
            BigDecimal price,
            CreateProductAvailability availability) {
        validateProductId(productId);
        validateVariantId(variantId);

        String normalizedName = normalizeText(name);
        String normalizedCategory = normalizeText(categoryName);
        String normalizedSize = normalizeText(size);
        String normalizedColor = normalizeText(color);
        validate(
                normalizedName,
                normalizedCategory,
                normalizedSize,
                normalizedColor,
                price,
                availability);

        GarmentProductDetails existing = productRepository.findProductById(productId)
                .orElseThrow(ProductNotFoundException::new);
        ProductVariant selectedVariant = existing.variants().stream()
                .filter(variant -> variant.id() == variantId)
                .findFirst()
                .orElseThrow(() -> new ProductValidationException(Map.of(
                        "variantId", "The selected variant does not belong to this product.")));
        if (selectedVariant.status() == VariantStatus.DISCONTINUED) {
            throw new ProductValidationException(Map.of(
                    "variantId", "A discontinued variant cannot be edited."));
        }

        ProductCategory category = findOrCreateCategory(normalizedCategory);
        if (category.status() != CategoryStatus.ACTIVE) {
            throw new InactiveProductCategoryException();
        }

        try {
            int updatedProducts = productRepository.updateProduct(
                    productId, category.id(), normalizedName);
            int updatedVariants = productRepository.updateVariant(
                    productId,
                    variantId,
                    normalizedSize,
                    normalizedColor,
                    price,
                    availability.toVariantStatus());
            if (updatedProducts != 1 || updatedVariants != 1) {
                throw new IllegalStateException("Garment product update affected an unexpected row count.");
            }
        } catch (DuplicateKeyException exception) {
            throw new ProductValidationException(Map.of(
                    "size", "This product already has a variant with the selected size and color.",
                    "color", "This product already has a variant with the selected size and color."));
        }

        return productRepository.findProductById(productId)
                .orElseThrow(() -> new IllegalStateException(
                        "Updated garment product could not be read back."));
    }

    @Transactional(readOnly = true)
    public GarmentProductDetails getProduct(long productId) {
        validateProductId(productId);
        return productRepository.findProductById(productId)
                .orElseThrow(ProductNotFoundException::new);
    }

    @Transactional(readOnly = true)
    public GarmentProductDetails getPublicCatalogProduct(long productId) {
        validateProductId(productId);
        return productRepository.findPublicCatalogProductById(productId)
                .orElseThrow(ProductNotFoundException::new);
    }

    @Transactional(readOnly = true)
    public List<GarmentProductDetails> getPublicCatalog() {
        return productRepository.findPublicCatalog();
    }

    @Transactional(readOnly = true)
    public List<GarmentProductDetails> getPublicCatalog(
            String search,
            String category,
            String size,
            String color,
            String availability) {
        String normalizedSearch = normalizeOptionalText(search);
        String normalizedCategory = normalizeOptionalText(category);
        String normalizedSize = normalizeOptionalText(size);
        String normalizedColor = normalizeOptionalText(color);
        Map<String, String> fields = new LinkedHashMap<>();

        validateOptionalText(fields, "search", normalizedSearch, 160, "Search");
        validateOptionalText(fields, "category", normalizedCategory, 100, "Category");
        validateOptionalText(fields, "size", normalizedSize, 32, "Size");
        validateOptionalText(fields, "color", normalizedColor, 64, "Color");
        VariantStatus normalizedAvailability = parseAvailability(availability, fields);

        if (!fields.isEmpty()) {
            throw new ProductValidationException(fields);
        }

        return productRepository.findPublicCatalog(new ProductCatalogFilter(
                normalizedSearch,
                normalizedCategory,
                normalizedSize,
                normalizedColor,
                normalizedAvailability));
    }

    private ProductCategory findOrCreateCategory(String categoryName) {
        var existing = productRepository.findCategoryByName(categoryName);
        if (existing.isPresent()) {
            return existing.get();
        }

        try {
            long categoryId = productRepository.createCategory(categoryName);
            return productRepository.findCategoryByName(categoryName)
                    .filter(category -> category.id() == categoryId)
                    .orElseThrow(() -> new IllegalStateException(
                            "Created garment category could not be read back."));
        } catch (DuplicateKeyException exception) {
            return productRepository.findCategoryByName(categoryName).orElseThrow(() -> exception);
        }
    }

    private void validateProductId(long productId) {
        if (productId <= 0) {
            throw new ProductValidationException(
                    Map.of("productId", "Product ID must be a positive number."));
        }
    }

    private void validateVariantId(long variantId) {
        if (variantId <= 0) {
            throw new ProductValidationException(
                    Map.of("variantId", "Variant ID must be a positive number."));
        }
    }

    private String normalizeText(String value) {
        if (value == null) {
            return "";
        }
        return Normalizer.normalize(value.trim(), Normalizer.Form.NFKC)
                .replaceAll("\\s+", " ");
    }

    private String normalizeOptionalText(String value) {
        String normalized = normalizeText(value);
        return normalized.isEmpty() ? null : normalized;
    }

    private VariantStatus parseAvailability(
            String availability, Map<String, String> fields) {
        String normalized = normalizeOptionalText(availability);
        if (normalized == null) {
            return null;
        }
        try {
            return VariantStatus.valueOf(normalized.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            fields.put(
                    "availability",
                    "Availability must be AVAILABLE, UNAVAILABLE, or DISCONTINUED.");
            return null;
        }
    }

    private void validateOptionalText(
            Map<String, String> fields,
            String field,
            String value,
            int maximumLength,
            String label) {
        if (value != null && value.length() > maximumLength) {
            fields.put(field, label + " must not exceed " + maximumLength + " characters.");
        }
    }

    private void validate(
            String name,
            String category,
            String size,
            String color,
            BigDecimal price,
            CreateProductAvailability availability) {
        Map<String, String> fields = new LinkedHashMap<>();
        validateText(fields, "name", name, 160, "Product name");
        validateText(fields, "category", category, 100, "Category");
        validateText(fields, "size", size, 32, "Size");
        validateText(fields, "color", color, 64, "Color");

        if (price == null
                || price.compareTo(BigDecimal.ZERO) <= 0
                || price.scale() > 2
                || price.precision() - price.scale() > 10) {
            fields.put("price", "Price must be positive with at most 10 digits and 2 decimals.");
        }
        if (availability == null) {
            fields.put("availability", "Availability is required.");
        }
        if (!fields.isEmpty()) {
            throw new ProductValidationException(fields);
        }
    }

    private void validateText(
            Map<String, String> fields,
            String field,
            String value,
            int maximumLength,
            String label) {
        if (value.isBlank()) {
            fields.put(field, label + " is required.");
        } else if (value.length() > maximumLength) {
            fields.put(field, label + " must not exceed " + maximumLength + " characters.");
        }
    }
}
