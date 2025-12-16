import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

let pool: mysql.Pool | null = null

function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL no está configurado en las variables de entorno')
    }
    pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    })
  }
  return pool
}

// DELETE - Eliminar un regalo específico
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de regalo requerido' },
        { status: 400 }
      )
    }

    const connection = await getPool().getConnection()
    try {
      await connection.query('DELETE FROM gifts WHERE id = ?', [id])
      return NextResponse.json({ success: true, message: 'Regalo eliminado' })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Error deleting gift:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el regalo' },
      { status: 500 }
    )
  }
}
