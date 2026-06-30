import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const subjects = await prisma.subject.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(subjects)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, description, colour } = body

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const subject = await prisma.subject.create({
    data: {
      name: name.trim(),
      description: typeof description === 'string' ? description : null,
      colour: typeof colour === 'string' ? colour : null,
      userId: session.user.id,
    },
  })

  return NextResponse.json(subject, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id, name, description, colour } = body

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Subject id is required' }, { status: 400 })
  }

  const existing = await prisma.subject.findUnique({ where: { id } })

  if (!existing || existing.userId !== session.user.id) {
    // Same response for "not found" and "not yours" — don't leak which one
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const updated = await prisma.subject.update({
    where: { id },
    data: {
      ...(typeof name === 'string' ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(colour !== undefined ? { colour } : {}),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Subject id is required' }, { status: 400 })
  }

  const existing = await prisma.subject.findUnique({ where: { id } })

  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.subject.delete({ where: { id } })

  return NextResponse.json({ success: true })
}