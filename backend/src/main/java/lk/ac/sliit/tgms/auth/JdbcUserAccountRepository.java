package lk.ac.sliit.tgms.auth;

import java.sql.PreparedStatement;
import java.util.Map;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcUserAccountRepository implements UserAccountRepository {

    private static final String SELECT_ACCOUNT = """
            SELECT id, email, password_hash, full_name, role, is_active
            FROM users
            """;

    private static final RowMapper<UserAccount> ACCOUNT_MAPPER = (resultSet, rowNumber) ->
            new UserAccount(
                    resultSet.getLong("id"),
                    resultSet.getString("email"),
                    resultSet.getString("password_hash"),
                    resultSet.getString("full_name"),
                    UserRole.valueOf(resultSet.getString("role")),
                    resultSet.getBoolean("is_active"));

    private final JdbcTemplate jdbcTemplate;

    public JdbcUserAccountRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public Optional<UserAccount> findByEmail(String normalizedEmail) {
        return jdbcTemplate.query(
                        SELECT_ACCOUNT + " WHERE email = ?", ACCOUNT_MAPPER, normalizedEmail)
                .stream()
                .findFirst();
    }

    @Override
    public Optional<UserAccount> findById(long id) {
        return jdbcTemplate.query(SELECT_ACCOUNT + " WHERE id = ?", ACCOUNT_MAPPER, id)
                .stream()
                .findFirst();
    }

    @Override
    public UserAccount create(
            String fullName, String normalizedEmail, String passwordHash, UserRole role) {
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(
                connection -> {
                    PreparedStatement statement = connection.prepareStatement(
                            """
                            INSERT INTO users (email, password_hash, full_name, role)
                            VALUES (?, ?, ?, ?)
                            """,
                            new String[] {"id"});
                    statement.setString(1, normalizedEmail);
                    statement.setString(2, passwordHash);
                    statement.setString(3, fullName);
                    statement.setString(4, role.name());
                    return statement;
                },
                keyHolder);

        long id = generatedId(keyHolder);
        return new UserAccount(id, normalizedEmail, passwordHash, fullName, role, true);
    }

    private long generatedId(KeyHolder keyHolder) {
        Map<String, Object> keys = keyHolder.getKeys();
        if (keys != null) {
            return keys.entrySet().stream()
                    .filter(entry -> entry.getKey().equalsIgnoreCase("id"))
                    .map(Map.Entry::getValue)
                    .filter(Number.class::isInstance)
                    .map(Number.class::cast)
                    .findFirst()
                    .map(Number::longValue)
                    .orElseThrow(() -> new IllegalStateException("Database did not return a user ID."));
        }

        throw new IllegalStateException("Database did not return a user ID.");
    }
}
