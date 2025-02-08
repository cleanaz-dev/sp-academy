// app/api/achievements/check-achievements/user/route.js
import { NextResponse } from 'next/server';
import { checkAchievements } from '@/lib/checkAchievements';
import { auth } from '@clerk/nextjs';

export async function POST(request) {
  try {
    // Verify authentication
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the user ID from the request body
    const body = await request.json();
    
    // You might want to modify checkAchievements to check only for specific user
    const result = await checkAchievements(body.userId); // You'll need to modify this function

    return NextResponse.json(result);
  } catch (error) {
    console.error('Achievement check failed:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}