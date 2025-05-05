import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb/connection';
import TranslationHistory, { ITranslationHistory } from '@/lib/mongodb/models/TranslationHistory';
import { auth } from '@/app/api/auth/[...nextauth]/route';

// GET all translation history
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const session = await auth();

    // If user is logged in, filter by userId
    const query = session?.user?.id ? { userId: session.user.id } : {};

    const translations = await TranslationHistory.find(query).sort({ timestamp: -1 });
    return NextResponse.json(translations);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch translation history' }, { status: 500 });
  }
}

// POST a new translation
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const session = await auth();

    // If user is logged in, associate the translation with their ID
    if (session?.user?.id) {
      data.userId = session.user.id;
    }

    const translation = await TranslationHistory.create(data);
    return NextResponse.json(translation, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save translation' }, { status: 500 });
  }
}

// DELETE a translation
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const clearAll = searchParams.get('clearAll');
    const session = await auth();

    // Create a query that includes userId if user is logged in
    const userQuery = session?.user?.id ? { userId: session.user.id } : {};

    if (clearAll === 'true') {
      // Delete all translations for the current user only if logged in
      // If not logged in, delete all translations without userId
      await TranslationHistory.deleteMany(userQuery);
      return NextResponse.json({ message: 'All translations deleted successfully' });
    }

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Only delete if the translation belongs to the current user or has no userId
    const query = { _id: id, ...userQuery };
    const deletedTranslation = await TranslationHistory.findOneAndDelete(query);

    if (!deletedTranslation) {
      return NextResponse.json({ error: 'Translation not found or not authorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Translation deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete translation' }, { status: 500 });
  }
}
