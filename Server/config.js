export const PORT = process.env.PORT || 4000;

export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_USER = process.env.DB_USER || 'root';
export const DB_PASSWORD = process.env.DB_PASSWORD || 'nohayplanetaB10!';
export const DB_NAME = process.env.DB_NAME || 'betafinal';
export const DB_PORT = process.env.DB_PORT || 3306;

const database = {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER, 
    password: DB_PASSWORD,
    database: DB_NAME,
    ssl: false
};
export default database 
