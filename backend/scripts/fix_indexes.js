const sequelize = require('./src/config/db');

async function cleanTable(tableName) {
    // console.log(`Checking table '${tableName}'...`);
    try {
        const [results] = await sequelize.query(`SHOW INDEX FROM \`${tableName}\``);

        // Group by column name
        const indexesByColumn = {};

        results.forEach(idx => {
            if (idx.Key_name === 'PRIMARY') return;
            if (!idx.Column_name) return;

            if (!indexesByColumn[idx.Column_name]) {
                indexesByColumn[idx.Column_name] = [];
            }
            indexesByColumn[idx.Column_name].push(idx.Key_name);
        });

        for (const [colName, indexes] of Object.entries(indexesByColumn)) {
            // Deduplicate logic
            const uniqueIndexes = [...new Set(indexes)];

            // We want to keep just ONE index per column (if they are single-column constraints)
            if (uniqueIndexes.length > 1) {
                console.log(`Table '${tableName}' has ${uniqueIndexes.length} indexes on '${colName}'. Cleaning...`);

                // Sort so we might keep the shortest name or 'colName' itself
                // Usually we want to keep one.
                // We'll keep the first one in the list arbitrarily or sort.
                uniqueIndexes.sort();

                // If one of them is exactly the column name, keep it?
                // Or just keep the first one.

                const toDrop = uniqueIndexes.slice(1);

                for (const idxName of toDrop) {
                    console.log(`Dropping index: ${idxName} on ${tableName}`);
                    try {
                        await sequelize.query(`DROP INDEX \`${idxName}\` ON \`${tableName}\``);
                    } catch (e) {
                        console.error(`Failed to drop ${idxName}:`, e.message);
                    }
                }
            }
        }

    } catch (e) {
        // Some unrelated tables (like SequelizeMeta) might error or not be interesting
        console.error(`Error checking ${tableName}:`, e.message);
    }
}

async function fix() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        const [tables] = await sequelize.query('SHOW TABLES');
        // tables is array of objects { Tables_in_dbname: 'tablename' }

        const tableNames = tables.map(t => Object.values(t)[0]);
        console.log(`Found ${tableNames.length} tables.`);

        for (const table of tableNames) {
            await cleanTable(table);
        }

        console.log('All tables checked.');
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

fix();
