import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

// Validar que DATABASE_URL esté configurado
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está configurado en las variables de entorno')
}

const DATABASE_URL = process.env.DATABASE_URL

// Crear pool de conexiones con configuración mejorada
const pool = mysql.createPool({
  uri: DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  maxIdle: 10,
  idleTimeout: 60000,
  connectTimeout: 30000,
})

// Inicializar las tablas si no existen
async function initializeDatabase() {
  const connection = await pool.getConnection()
  try {
    // Tabla de participantes
    await connection.query(`
      CREATE TABLE IF NOT EXISTS participants (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Tabla de regalos
    await connection.query(`
      CREATE TABLE IF NOT EXISTS gifts (
        id VARCHAR(50) PRIMARY KEY,
        participant_id VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        link TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
      )
    `)
    
    // Tabla de asignaciones
    await connection.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        giver_id VARCHAR(50) NOT NULL,
        receiver_id VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_giver (giver_id),
        FOREIGN KEY (giver_id) REFERENCES participants(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES participants(id) ON DELETE CASCADE
      )
    `)
    
    // Tabla de configuración
    await connection.query(`
      CREATE TABLE IF NOT EXISTS config (
        id INT PRIMARY KEY DEFAULT 1,
        is_assignment_generated BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)
    
    // Insertar configuración inicial si no existe
    await connection.query(`
      INSERT IGNORE INTO config (id, is_assignment_generated) VALUES (1, FALSE)
    `)
    
  } finally {
    connection.release()
  }
}

// Función auxiliar para ejecutar queries con retry
async function executeWithRetry<T>(operation: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation()
    } catch (error: any) {
      const isLastAttempt = i === retries - 1
      const isConnectionError = error.code === 'PROTOCOL_CONNECTION_LOST' || 
                                error.code === 'ECONNRESET' ||
                                error.code === 'ETIMEDOUT'
      
      if (isConnectionError && !isLastAttempt) {
        console.log(`Reintentando conexión... (intento ${i + 1}/${retries})`)
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
        continue
      }
      throw error
    }
  }
  throw new Error('No se pudo completar la operación después de varios intentos')
}

// Leer todos los datos de la base de datos
async function readData() {
  return executeWithRetry(async () => {
    await initializeDatabase()
    const connection = await pool.getConnection()
    try {
    // Obtener participantes
    const [participants] = await connection.query('SELECT id, name FROM participants ORDER BY created_at')
    
    // Obtener regalos
    const [gifts] = await connection.query('SELECT id, participant_id as participantId, title, description, link FROM gifts ORDER BY created_at')
    
    // Obtener asignaciones
    const [assignmentsRows] = await connection.query('SELECT giver_id, receiver_id FROM assignments')
    const assignments: Record<string, string> = {}
    for (const row of assignmentsRows as any[]) {
      assignments[row.giver_id] = row.receiver_id
    }
    
    // Obtener configuración
    const [config] = await connection.query('SELECT is_assignment_generated FROM config WHERE id = 1')
    const isAssignmentGenerated = (config as any[])[0]?.is_assignment_generated || false
    
      return {
        participants,
        gifts,
        assignments,
        isAssignmentGenerated
      }
    } finally {
      connection.release()
    }
  })
}

// Escribir datos en la base de datos
async function writeData(data: any) {
  return executeWithRetry(async () => {
    const connection = await pool.getConnection()
    try {
    await connection.beginTransaction()
    
    // Insertar o actualizar participantes (NUNCA ELIMINAR)
    for (const participant of data.participants) {
      await connection.query(
        `INSERT INTO participants (id, name) VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        [participant.id, participant.name]
      )
    }
    
    // Insertar o actualizar regalos (NUNCA ELIMINAR)
    for (const gift of data.gifts) {
      await connection.query(
        `INSERT INTO gifts (id, participant_id, title, description, link) 
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         title = VALUES(title),
         description = VALUES(description),
         link = VALUES(link)`,
        [gift.id, gift.participantId, gift.title, gift.description || '', gift.link || '']
      )
    }
    
    // Sincronizar asignaciones solo si existen
    if (Object.keys(data.assignments).length > 0) {
      // Eliminar asignaciones existentes solo si hay nuevas asignaciones
      await connection.query('DELETE FROM assignments')
      for (const [giverId, receiverId] of Object.entries(data.assignments)) {
        await connection.query(
          'INSERT INTO assignments (giver_id, receiver_id) VALUES (?, ?)',
          [giverId, receiverId]
        )
      }
    }
    
    // Actualizar configuración
    await connection.query(
      'UPDATE config SET is_assignment_generated = ? WHERE id = 1',
      [data.isAssignmentGenerated]
    )
    
      await connection.commit()
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  })
}

// GET - Obtener datos
export async function GET() {
  try {
    const data = await readData()
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
    await writeData(newData)
    return NextResponse.json({ success: true, data: newData })
  } catch (error) {
    console.error('Error writing data:', error)
    return NextResponse.json(
      { error: 'Error al guardar los datos' },
      { status: 500 }
    )
  }
}
