import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { deleteGirl, updateGirl, getGirlById } from '@/lib/db/girls-queries';

type Props = {
  params: Promise<{ id: string }>;
};

export async function DELETE(
  request: NextRequest,
  props: Props
) {
  const params = await props.params;
  try {
    // Check authentication first
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    await deleteGirl(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting girl:', error);
    return NextResponse.json(
      { error: 'Failed to delete girl' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  props: Props
) {
  const params = await props.params;
  try {
    // Check authentication first
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const girl = await updateGirl(id, body);
    return NextResponse.json(girl);
  } catch (error) {
    console.error('Error updating girl:', error);
    return NextResponse.json(
      { error: 'Failed to update girl' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  props: Props
) {
  const params = await props.params;
  try {
    // Check authentication first
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    const girl = await getGirlById(id);
    
    if (!girl) {
      return NextResponse.json(
        { error: 'Girl not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(girl);
  } catch (error) {
    console.error('Error fetching girl:', error);
    return NextResponse.json(
      { error: 'Failed to fetch girl' },
      { status: 500 }
    );
  }
}