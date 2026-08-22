package lk.ac.sliit.tgms;

import static org.assertj.core.api.Assertions.assertThat;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import liquibase.Contexts;
import liquibase.LabelExpression;
import liquibase.Liquibase;
import liquibase.database.Database;
import liquibase.database.DatabaseFactory;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.junit.jupiter.api.Test;

class DatabaseMigrationTests {

    private static final String CHANGELOG = "db/changelog/db.changelog-master.xml";
    private static final String URL =
            "jdbc:h2:mem:migration_workflow;MODE=MySQL;DB_CLOSE_DELAY=-1";

    @Test
    void migrationsApplyRollbackAndApplyAgainWithoutBusinessTables() throws Exception {
        try (Connection connection = DriverManager.getConnection(URL, "sa", "")) {
            Database database = DatabaseFactory.getInstance()
                    .findCorrectDatabaseImplementation(new JdbcConnection(connection));

            try (Liquibase liquibase = new Liquibase(
                    CHANGELOG, new ClassLoaderResourceAccessor(), database)) {
                liquibase.update(new Contexts(), new LabelExpression());
                assertThat(executedChangeSetCount(connection)).isEqualTo(1);
                assertThat(applicationTableCount(connection)).isZero();

                liquibase.rollback(1, new Contexts(), new LabelExpression());
                assertThat(executedChangeSetCount(connection)).isZero();

                liquibase.update(new Contexts(), new LabelExpression());
                assertThat(executedChangeSetCount(connection)).isEqualTo(1);
                assertThat(applicationTableCount(connection)).isZero();
            }
        }
    }

    private long executedChangeSetCount(Connection connection) throws Exception {
        try (Statement statement = connection.createStatement();
                ResultSet resultSet = statement.executeQuery("SELECT COUNT(*) FROM databasechangelog")) {
            resultSet.next();
            return resultSet.getLong(1);
        }
    }

    private long applicationTableCount(Connection connection) throws Exception {
        String query = """
                SELECT COUNT(*)
                FROM information_schema.tables
                WHERE LOWER(table_schema) = 'public'
                  AND LOWER(table_name) NOT IN ('databasechangelog', 'databasechangeloglock')
                """;
        try (Statement statement = connection.createStatement();
                ResultSet resultSet = statement.executeQuery(query)) {
            resultSet.next();
            return resultSet.getLong(1);
        }
    }
}
