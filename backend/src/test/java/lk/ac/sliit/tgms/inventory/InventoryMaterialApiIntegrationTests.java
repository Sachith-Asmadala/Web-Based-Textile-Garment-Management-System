package lk.ac.sliit.tgms.inventory;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.servlet.http.Cookie;
import lk.ac.sliit.tgms.auth.AuthCookieService;
import lk.ac.sliit.tgms.auth.AuthTokenService;
import lk.ac.sliit.tgms.auth.UserAccount;
import lk.ac.sliit.tgms.auth.UserRole;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest
class InventoryMaterialApiIntegrationTests {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private AuthTokenService authTokenService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        cleanInventoryMaterials();
        cleanTestAccounts();
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    @AfterEach
    void tearDown() {
        cleanInventoryMaterials();
        cleanTestAccounts();
    }

    @Test
    void inventoryManagerCreatesNormalizedMaterialAndSeesItInList() throws Exception {
        UserAccount inventoryManager = insertUser(
                6901, "inventory6901@example.com", UserRole.INVENTORY_MANAGER);

        mockMvc.perform(post("/api/inventory-materials")
                        .cookie(sessionFor(inventoryManager, UserRole.INVENTORY_MANAGER))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "materialCode": "  INV-FAB-001  ",
                                  "materialName": "  Cotton   twill fabric  ",
                                  "materialDescription": "  Main store 240 GSM cotton twill  ",
                                  "materialType": "FABRIC",
                                  "unitOfMeasure": " metre ",
                                  "currentQuantity": 840.250,
                                  "lowStockThreshold": 100.000
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(header().string(
                        HttpHeaders.LOCATION,
                        Matchers.matchesPattern("/api/inventory-materials/[1-9][0-9]*")))
                .andExpect(jsonPath("$.message")
                        .value("Inventory material created successfully."))
                .andExpect(jsonPath("$.material.id").isNumber())
                .andExpect(jsonPath("$.material.materialCode").value("INV-FAB-001"))
                .andExpect(jsonPath("$.material.materialName").value("Cotton twill fabric"))
                .andExpect(jsonPath("$.material.materialDescription")
                        .value("Main store 240 GSM cotton twill"))
                .andExpect(jsonPath("$.material.materialType").value("FABRIC"))
                .andExpect(jsonPath("$.material.unitOfMeasure").value("metre"))
                .andExpect(jsonPath("$.material.currentQuantity").value("840.250"))
                .andExpect(jsonPath("$.material.lowStockThreshold").value("100.000"))
                .andExpect(jsonPath("$.material.status").value("ACTIVE"));

        assertThat(jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM inventory_materials WHERE material_code = ?",
                        Integer.class,
                        "INV-FAB-001"))
                .isEqualTo(1);

        mockMvc.perform(get("/api/inventory-materials")
                        .cookie(sessionFor(inventoryManager, UserRole.INVENTORY_MANAGER)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.materials.length()").value(1))
                .andExpect(jsonPath("$.materials[0].materialCode").value("INV-FAB-001"));
    }

    @Test
    void invalidAndDuplicateInventoryMaterialValuesAreRejectedClearly() throws Exception {
        UserAccount inventoryManager = insertUser(
                6902, "inventory6902@example.com", UserRole.INVENTORY_MANAGER);
        Cookie session = sessionFor(inventoryManager, UserRole.INVENTORY_MANAGER);

        mockMvc.perform(post("/api/inventory-materials")
                        .cookie(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "materialCode": "   ",
                                  "materialName": "",
                                  "materialType": null,
                                  "unitOfMeasure": "   ",
                                  "currentQuantity": -1,
                                  "lowStockThreshold": -0.001
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.error.fields.materialCode")
                        .value("Material code is required."))
                .andExpect(jsonPath("$.error.fields.materialName")
                        .value("Material name is required."))
                .andExpect(jsonPath("$.error.fields.materialType")
                        .value("Material type is required."))
                .andExpect(jsonPath("$.error.fields.unitOfMeasure")
                        .value("Unit of measure is required."))
                .andExpect(jsonPath("$.error.fields.currentQuantity")
                        .value("Opening quantity must be greater than zero."))
                .andExpect(jsonPath("$.error.fields.lowStockThreshold")
                        .value("Low-stock threshold cannot be negative."));

        mockMvc.perform(post("/api/inventory-materials")
                        .cookie(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validMaterialRequest()))
                .andExpect(status().isCreated());
        mockMvc.perform(post("/api/inventory-materials")
                        .cookie(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validMaterialRequest()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code")
                        .value("INVENTORY_MATERIAL_CODE_EXISTS"))
                .andExpect(jsonPath("$.error.fields.materialCode").exists());

        assertThat(jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM inventory_materials WHERE material_code = ?",
                        Integer.class,
                        "INV-RAW-001"))
                .isEqualTo(1);
    }

    @Test
    void inventoryMaterialCreateAndListRequireInventoryManagerRole() throws Exception {
        UserAccount customer = insertUser(6903, "customer6903@example.com", UserRole.CUSTOMER);

        mockMvc.perform(post("/api/inventory-materials")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validMaterialRequest()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error.code").value("UNAUTHORIZED"));
        mockMvc.perform(post("/api/inventory-materials")
                        .cookie(sessionFor(customer, UserRole.CUSTOMER))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validMaterialRequest()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error.code").value("FORBIDDEN"));
        mockMvc.perform(get("/api/inventory-materials")
                        .cookie(sessionFor(customer, UserRole.CUSTOMER)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error.code").value("FORBIDDEN"));
    }

    private String validMaterialRequest() {
        return """
                {
                  "materialCode": "INV-RAW-001",
                  "materialName": "Polyester lining",
                  "materialDescription": "Roll stock for production orders",
                  "materialType": "RAW_MATERIAL",
                  "unitOfMeasure": "roll",
                  "currentQuantity": 25.000,
                  "lowStockThreshold": 5.000
                }
                """;
    }

    private UserAccount insertUser(long id, String email, UserRole role) {
        jdbcTemplate.update(
                """
                INSERT INTO users (id, email, password_hash, full_name, role)
                VALUES (?, ?, ?, ?, ?)
                """,
                id,
                email,
                "$2a$10$01234567890123456789012345678901234567890123456789012",
                "Inventory API User " + id,
                role.name());
        return new UserAccount(
                id,
                email,
                "$2a$10$01234567890123456789012345678901234567890123456789012",
                "Inventory API User " + id,
                role,
                true);
    }

    private Cookie sessionFor(UserAccount account, UserRole tokenRole) {
        String token = authTokenService.issue(
                new UserAccount(
                        account.id(),
                        account.email(),
                        account.passwordHash(),
                        account.fullName(),
                        tokenRole,
                        account.active()));
        Cookie cookie = new Cookie(AuthCookieService.COOKIE_NAME, token);
        cookie.setPath("/");
        return cookie;
    }

    private void cleanInventoryMaterials() {
        jdbcTemplate.update("DELETE FROM inventory_materials");
    }

    private void cleanTestAccounts() {
        jdbcTemplate.update("DELETE FROM users WHERE email LIKE '%690%@example.com'");
    }
}
