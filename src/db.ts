import { Pool, QueryResult } from 'pg';

// Data for connection to the database
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

type QueryParams = Record<string, any>;

// Handles parameters and converts them to the format that pg expects
function sqlFormatNamed(sql: string, params: QueryParams): [string, any[]] {
  const keys = Object.keys(params);
  const values = keys.map(key => params[key]);
  const formatted = sql.replace(/\$(\w+)/g, (_, key) => {
    const index = keys.indexOf(key);
    return index >= 0 ? `$${index + 1}` : '';
  });
  return [formatted, values];
}
/**
 *  Гарна практика робити міграції при кожному запуску сервера, не по виклику команди в терміналі
 */
export default {
  query: async (text: string, params: QueryParams = {}): Promise<QueryResult> => {
    const [formattedText, values] = sqlFormatNamed(text, params);
    return pool.query(formattedText, values);
  },
};