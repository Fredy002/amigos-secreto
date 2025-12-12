import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const DATABASE_URL = process.env.DATABASE_URL || 'mysql://root:WxphSUUGbTrgRuNSjDKShvNLMiBJHtPb@yamabiko.proxy.rlwy.net:27579/railway'

// Crear pool de conexiones
const pool = mysql.createPool(DATABASE_URL)

// Inicializar la tabla si no existe
async function initializeDatabase() {
  const connection = await pool.getConnection()
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS regalitos_data (
        id INT PRIMARY KEY DEFAULT 1,
        data JSON NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)
    
    // Verificar si existe un registro, si no, crear uno inicial
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM regalitos_data WHERE id = 1')
    const count = (rows as any)[0].count
    
    if (count === 0) {
      const initialData = {
        participants: [],
        gifts: [],
        assignments: {},
        isAssignmentGenerated: false,
      }
      await connection.query('INSERT INTO regalitos_data (id, data) VALUES (1, ?)', [JSON.stringify(initialData)])
    }
  } finally {
    connection.release()
  }
}

// Leer datos de la base de datos
async function readData() {
  await initializeDatabase()
  const connection = await pool.getConnection()
  try {
    const [rows] = await connection.query('SELECT data FROM regalitos_data WHERE id = 1')
    const result = rows as any[]
    return result[0] ? JSON.parse(result[0].data) : {
      participants: [],
      gifts: [],
      assignments: {},
      isAssignmentGenerated: false,
    }
  } finally {
    connection.release()
  }
}

// Escribir datos en la base de datos
async function writeData(data: any) {
  const connection = await pool.getConnection()
  try {
    await connection.query('UPDATE regalitos_data SET data = ? WHERE id = 1', [JSON.stringify(data)])
  } finally {
    connection.release()
  }
}

// GET - Obtener datos
export async function GET() {
  try {
    const data = readData()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error reading data:', error)
    return NextResponse.json(
      { error: 'Error al leer los datos' },
      { status: 500 }
    )
  }
}

// POST - Actualizar datos
export async function POST(request: Request) {
  try {
    const newData = await request.json()
    writeData(newData)
    return NextResponse.json({ success: true, data: newData })
  } catch (error) {
    console.error('Error writing data:', error)
    return NextResponse.json(
      { error: 'Error al guardar los datos' },
      { status: 500 }
    )
  }
}
