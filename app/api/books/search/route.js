// app/api/books/search/route.js
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const language = searchParams.get('lang'); // 'fr' for French
  const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

  const url = `https://www.googleapis.com/books/v1/volumes?q=${query}${language ? `&langRestrict=${language}` : ''}&key=${API_KEY}`;
  
  const response = await fetch(url);
  const data = await response.json();
  return Response.json(data);
}