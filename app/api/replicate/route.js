// app/api/replicate/route.js

import { NextResponse } from 'next/server';
import Replicate from 'replicate';

export async function POST(request) {
  try {
    const { prompt, model } = await request.json();

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Create the prediction
    const prediction = await replicate.predictions.create({
      model: model,
      input: { prompt },
    });


    // Wait for the prediction to finish
    const finishedPrediction = await replicate.wait(prediction);

    return NextResponse.json(finishedPrediction.output[0], { status: 200 });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
