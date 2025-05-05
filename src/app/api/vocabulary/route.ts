import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb/connection';
import VocabularyNote, { IVocabularyNote } from '@/lib/mongodb/models/VocabularyNote';
import { auth } from '@/app/api/auth/[...nextauth]/route';

// GET all vocabulary notes
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const session = await auth();

    // If user is logged in, filter by userId
    const query = session?.user?.id ? { userId: session.user.id } : {};

    const notes = await VocabularyNote.find(query).sort({ createdAt: -1 });
    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch vocabulary notes' }, { status: 500 });
  }
}

// POST a new vocabulary note
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const session = await auth();

    // If user is logged in, associate the note with their ID
    if (session?.user?.id) {
      data.userId = session.user.id;
    }

    const note = await VocabularyNote.create(data);
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create vocabulary note' }, { status: 500 });
  }
}

// DELETE a vocabulary note
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const session = await auth();

    // Create a query that includes userId if user is logged in
    const userQuery = session?.user?.id ? { userId: session.user.id } : {};

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Only delete if the note belongs to the current user or has no userId
    const query = { _id: id, ...userQuery };
    const deletedNote = await VocabularyNote.findOneAndDelete(query);

    if (!deletedNote) {
      return NextResponse.json({ error: 'Vocabulary note not found or not authorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Vocabulary note deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete vocabulary note' }, { status: 500 });
  }
}
