import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { syncClerkUserToSupabase, migrateSessionDataToUser } from '@/lib/supabase/user-mapping';

// Clerk webhook events
interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{ email_address: string; id: string }>;
    first_name?: string;
    last_name?: string;
    image_url?: string;
    created_at: number;
    updated_at: number;
  };
}

export async function POST(request: NextRequest) {
  // Verify webhook signature
  const headerPayload = await headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  const payload = await request.text();
  const body = JSON.parse(payload);

  // Verify webhook with Clerk
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: ClerkWebhookEvent;

  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  // Handle different event types
  try {
    switch (event.type) {
      case 'user.created':
        await handleUserCreated(event);
        break;
      case 'user.updated':
        await handleUserUpdated(event);
        break;
      case 'user.deleted':
        await handleUserDeleted(event);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error handling ${event.type}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleUserCreated(event: ClerkWebhookEvent) {
  console.log('Handling user.created event for:', event.data.id);

  // Transform Clerk data to our format
  const clerkUser = {
    id: event.data.id,
    emailAddresses: event.data.email_addresses.map(email => ({
      emailAddress: email.email_address,
      id: email.id,
    })),
    firstName: event.data.first_name,
    lastName: event.data.last_name,
    fullName: event.data.first_name && event.data.last_name 
      ? `${event.data.first_name} ${event.data.last_name}`
      : null,
    imageUrl: event.data.image_url,
    createdAt: event.data.created_at,
    updatedAt: event.data.updated_at,
  };

  // Sync user to Supabase
  const user = await syncClerkUserToSupabase(clerkUser);
  console.log('User synced to Supabase:', user.id);

  // TODO: In a real implementation, we might want to:
  // 1. Check for session data that needs to be migrated
  // 2. Send welcome email
  // 3. Initialize default user settings
  // 4. Create default team for the user
  
  return user;
}

async function handleUserUpdated(event: ClerkWebhookEvent) {
  console.log('Handling user.updated event for:', event.data.id);

  // Transform and sync updated data
  const clerkUser = {
    id: event.data.id,
    emailAddresses: event.data.email_addresses.map(email => ({
      emailAddress: email.email_address,
      id: email.id,
    })),
    firstName: event.data.first_name,
    lastName: event.data.last_name,
    fullName: event.data.first_name && event.data.last_name 
      ? `${event.data.first_name} ${event.data.last_name}`
      : null,
    imageUrl: event.data.image_url,
    createdAt: event.data.created_at,
    updatedAt: event.data.updated_at,
  };

  const user = await syncClerkUserToSupabase(clerkUser);
  console.log('User updated in Supabase:', user.id);

  return user;
}

async function handleUserDeleted(event: ClerkWebhookEvent) {
  console.log('Handling user.deleted event for:', event.data.id);

  // In this case, we might want to soft delete the user
  // by setting deletedAt timestamp rather than hard delete
  // This preserves data integrity and audit trails
  
  const { db } = await import('@/lib/db/drizzle');
  const { users } = await import('@/lib/db/schema');
  const { eq } = await import('drizzle-orm');

  await db
    .update(users)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.clerkId, event.data.id));

  console.log('User soft deleted in Supabase:', event.data.id);
}