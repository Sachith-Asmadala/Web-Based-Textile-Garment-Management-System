package lk.ac.sliit.tgms.profile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.servlet.http.Cookie;
import java.util.Map;
import lk.ac.sliit.tgms.auth.AuthCookieService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest
class UserProfileApiIntegrationTests {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        jdbcTemplate.update("DELETE FROM password_reset_tokens");
        jdbcTemplate.update("DELETE FROM users");
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    @Test
    void authenticatedUserCanLoadAndUpdateOnlyOwnPermittedProfileField() throws Exception {
        Cookie session = registerAndLogin(
                "Original Customer", "original@example.com", "secure-pass-123");

        Map<String, Object> original = jdbcTemplate.queryForMap(
                "SELECT id, email, password_hash, role, is_active FROM users WHERE email = ?",
                "original@example.com");
        long originalId = ((Number) original.get("id")).longValue();
        String originalEmail = (String) original.get("email");
        String originalPasswordHash = (String) original.get("password_hash");

        mockMvc.perform(get("/api/profile").cookie(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(originalId))
                .andExpect(jsonPath("$.fullName").value("Original Customer"))
                .andExpect(jsonPath("$.email").value("original@example.com"))
                .andExpect(jsonPath("$.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.active").doesNotExist());

        mockMvc.perform(put("/api/profile")
                        .cookie(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "id": 999999,
                                  "fullName": "  Updated    Customer  ",
                                  "email": "attacker@example.com",
                                  "role": "ADMINISTRATOR",
                                  "isActive": false,
                                  "password": "attacker-controlled",
                                  "passwordHash": "attacker-controlled"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(originalId))
                .andExpect(jsonPath("$.fullName").value("Updated Customer"))
                .andExpect(jsonPath("$.email").value(originalEmail))
                .andExpect(jsonPath("$.role").value("CUSTOMER"));

        Map<String, Object> stored = jdbcTemplate.queryForMap(
                "SELECT id, email, full_name, password_hash, role, is_active FROM users WHERE id = ?",
                originalId);
        assertThat(((Number) stored.get("id")).longValue()).isEqualTo(originalId);
        assertThat(stored.get("email")).isEqualTo(originalEmail);
        assertThat(stored.get("full_name")).isEqualTo("Updated Customer");
        assertThat(stored.get("password_hash")).isEqualTo(originalPasswordHash);
        assertThat(stored.get("role")).isEqualTo("CUSTOMER");
        assertThat(stored.get("is_active")).isEqualTo(true);

        mockMvc.perform(get("/api/profile").cookie(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Updated Customer"))
                .andExpect(jsonPath("$.email").value(originalEmail));
    }

    @Test
    void profileRoutesRequireAuthenticationAndValidateEditableField() throws Exception {
        mockMvc.perform(get("/api/profile"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error.code").value("UNAUTHORIZED"));

        mockMvc.perform(put("/api/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fullName":"Someone"}
                                """))
                .andExpect(status().isUnauthorized());

        Cookie session = registerAndLogin(
                "Validation Customer", "validation@example.com", "secure-pass-123");
        mockMvc.perform(put("/api/profile")
                        .cookie(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fullName":"   "}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.error.fields.fullName").exists());
    }

    private Cookie registerAndLogin(String fullName, String email, String password) throws Exception {
        register(fullName, email, password);
        MvcResult login = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(("""
                                {"email":"%s","password":"%s"}
                                """).formatted(email, password)))
                .andExpect(status().isOk())
                .andReturn();
        Cookie session = login.getResponse().getCookie(AuthCookieService.COOKIE_NAME);
        assertThat(session).isNotNull();
        return session;
    }

    private void register(String fullName, String email, String password) throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(("""
                                {"fullName":"%s","email":"%s","password":"%s"}
                                """).formatted(fullName, email, password)))
                .andExpect(status().isCreated());
    }
}
