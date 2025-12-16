import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está configurado en las variables de entorno')
}

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
})

// DELETE - Eliminar un participante específico
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de participante requerido' },
        { status: 400 }
      )
    }

    const connection = await pool.getConnection()
    try {
      // El CASCADE DELETE se encargará de eliminar regalos y asignaciones
      await connection.query('DELETE FROM participants WHERE id = ?', [id])
      return NextResponse.json({ success: true, message: 'Participante eliminado' })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Error deleting participant:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el participante' },
      { status: 500 }
    )
  }
}
