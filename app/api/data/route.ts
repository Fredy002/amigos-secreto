import { NextResponse } from 'next/server'

// Almacenamiento en memoria (para entornos serverless como Netlify)
// En producción, considera usar una base de datos como Vercel KV, MongoDB, etc.
let memoryStore: any = null

const initialData = {
  participants: [],
  gifts: [],
  assignments: {},
  isAssignmentGenerated: false,
}

// Leer datos (de memoria o inicializar)
function readData() {
  if (memoryStore === null) {
    memoryStore = { ...initialData }
  }
  return memoryStore
}

// Escribir datos (en memoria)
function writeData(data: any) {
  memoryStore = data
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
