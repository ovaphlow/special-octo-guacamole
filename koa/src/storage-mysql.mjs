import mysql from "mysql2";

export const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DATABASE || "",
    waitForConnections: true,
    // connectionLimit: PROC * 2 + 1, // 默认10
    queueLimit: 0,
});