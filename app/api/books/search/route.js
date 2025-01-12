// app/api/books/search/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const language = searchParams.get('lang'); // e.g., 'fr' for French
    const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

    if (!query) {
      return NextResponse.json(
        { error: 'The "q" query parameter is required.' },
        { status: 400 }
      );
    }

    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      query
    )}${language ? `&langRestrict=${encodeURIComponent(language)}` : ''}&key=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch data from Google Books API.' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in /api/books/search:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
