import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

// Validar que DATABASE_URL esté configurado
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está configurado en las variables de entorno')
}

const DATABASE_URL = process.env.DATABASE_URL

// Crear pool de conexiones
const pool = mysql.createPool(DATABASE_URL)

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

// Leer todos los datos de la base de datos
async function readData() {
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
}

// Escribir datos en la base de datos
async function writeData(data: any) {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    
    // Obtener IDs actuales para comparar
    const [currentParticipants] = await connection.query('SELECT id FROM participants')
    const currentIds = new Set((currentParticipants as any[]).map(p => p.id))
    const newIds = new Set(data.participants.map((p: any) => p.id))
    
    // Eliminar participantes que ya no están
    for (const current of currentParticipants as any[]) {
      if (!newIds.has(current.id)) {
        await connection.query('DELETE FROM participants WHERE id = ?', [current.id])
      }
    }
    
    // Insertar o actualizar participantes
    for (const participant of data.participants) {
      await connection.query(
        `INSERT INTO participants (id, name) VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        [participant.id, participant.name]
      )
    }
    
    // Sincronizar regalos
    const [currentGifts] = await connection.query('SELECT id FROM gifts')
    const currentGiftIds = new Set((currentGifts as any[]).map(g => g.id))
    const newGiftIds = new Set(data.gifts.map((g: any) => g.id))
    
    // Eliminar regalos que ya no están
    for (const current of currentGifts as any[]) {
      if (!newGiftIds.has(current.id)) {
        await connection.query('DELETE FROM gifts WHERE id = ?', [current.id])
      }
    }
    
    // Insertar o actualizar regalos
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
    
    // Actualizar asignaciones
    await connection.query('DELETE FROM assignments')
    for (const [giverId, receiverId] of Object.entries(data.assignments)) {
      await connection.query(
        'INSERT INTO assignments (giver_id, receiver_id) VALUES (?, ?)',
        [giverId, receiverId]
      )
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
