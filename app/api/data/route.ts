import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'regalitos-data.json')

// Asegurarse de que el directorio data existe
function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Leer datos del archivo
function readData() {
  ensureDataDirectory()
  
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      participants: [],
      gifts: [],
      assignments: {},
      isAssignmentGenerated: false,
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2))
    return initialData
  }
  
  const fileContent = fs.readFileSync(DATA_FILE, 'utf-8')
  return JSON.parse(fileContent)
}

// Escribir datos al archivo
function writeData(data: any) {
  ensureDataDirectory()
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
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
