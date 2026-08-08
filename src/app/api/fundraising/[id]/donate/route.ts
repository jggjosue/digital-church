import { randomUUID } from 'crypto';
import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { CHURCHES_COLLECTION, type ChurchLocation } from '@/lib/church-locations';
import type { DonationDocument } from '@/lib/donation-schema';
import type { FundraisingCampaignDoc } from '@/lib/fundraising-seed';
import { getDb } from '@/lib/mongodb';

const FUNDRAISING_COLLECTION = 'fundraising';
const DONATION_COLLECTION = 'donation';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Debe iniciar sesión para donar.' }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as { amount?: unknown } | null;
    const amount = Number(body?.amount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000_000) {
      return NextResponse.json({ error: 'Ingrese un monto válido mayor que cero.' }, { status: 400 });
    }

    const { id: rawId } = await context.params;
    const campaignId = rawId?.trim();
    if (!campaignId) {
      return NextResponse.json({ error: 'Campaña inválida.' }, { status: 400 });
    }

    const db = await getDb();
    const campaignCollection = db.collection<FundraisingCampaignDoc>(FUNDRAISING_COLLECTION);
    const campaign = await campaignCollection.findOne(
      { id: campaignId },
      { projection: { _id: 0 } }
    );
    if (!campaign) {
      return NextResponse.json({ error: 'Campaña no encontrada.' }, { status: 404 });
    }
    if (campaign.status !== 'Active') {
      return NextResponse.json(
        { error: 'Solo se puede donar a campañas activas.' },
        { status: 400 }
      );
    }

    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase() ?? '';
    const member = email
      ? await db.collection<Record<string, unknown>>('members').findOne(
          { email },
          { projection: { _id: 0, id: 1, firstName: 1, lastName: 1, email: 1, phone: 1 } }
        )
      : null;
    if (!member?.id) {
      return NextResponse.json(
        { error: 'Su usuario debe estar vinculado a un perfil para donar.' },
        { status: 403 }
      );
    }

    const church = campaign.churchId
      ? await db.collection<ChurchLocation>(CHURCHES_COLLECTION).findOne(
          { id: campaign.churchId },
          { projection: { _id: 0, id: 1, name: 1 } }
        )
      : null;
    if (!church) {
      return NextResponse.json(
        { error: 'La campaña no tiene un templo válido asignado.' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const donation: DonationDocument = {
      id: randomUUID(),
      year: String(new Date(now).getFullYear()),
      recordCategory: 'campaigns',
      donor: {
        memberId: String(member.id),
        firstName: String(member.firstName ?? 'Miembro'),
        lastName: String(member.lastName ?? ''),
        email: String(member.email ?? email),
        phone: String(member.phone ?? ''),
      },
      churchId: church.id,
      churchName: church.name,
      attendanceEvent: { id: campaign.id, name: campaign.name },
      amount,
      donationDate: now,
      fundCampaign: 'other-fund',
      paymentMethod: 'online',
      transferReference: `campaña:${campaign.id}`,
      donationFrequency: 'once',
      notes: `Donación a la campaña ${campaign.name}`,
      fundraisingCampaignId: campaign.id,
      fundraisingCampaignName: campaign.name,
      fundraisingCampaignSnapshot: {
        id: campaign.id,
        slug: campaign.slug,
        name: campaign.name,
        description: campaign.description,
        status: campaign.status,
        raisedBeforeDonation: campaign.raised,
        goal: campaign.goal,
        progressBeforeDonation: campaign.progress,
        date: campaign.date,
        sortOrder: campaign.sortOrder,
        churchId: campaign.churchId,
        createdByMemberId: campaign.createdByMemberId,
        createdByClerkUserId: campaign.createdByClerkUserId,
      },
      createdAt: now,
      updatedAt: now,
    };

    await db.collection<DonationDocument>(DONATION_COLLECTION).insertOne(donation);
    const campaignUpdate = await campaignCollection.updateOne(
      { id: campaign.id },
      [
        {
          $set: {
            raised: { $add: [{ $ifNull: ['$raised', 0] }, amount] },
            progress: {
              $cond: [
                { $gt: [{ $ifNull: ['$goal', 0] }, 0] },
                {
                  $round: [
                    {
                      $multiply: [
                        {
                          $divide: [
                            { $add: [{ $ifNull: ['$raised', 0] }, amount] },
                            '$goal',
                          ],
                        },
                        100,
                      ],
                    },
                    0,
                  ],
                },
                0,
              ],
            },
          },
        },
      ]
    );
    if (campaignUpdate.matchedCount === 0) {
      await db.collection<DonationDocument>(DONATION_COLLECTION).deleteOne({ id: donation.id });
      return NextResponse.json({ error: 'La campaña ya no está disponible.' }, { status: 409 });
    }
    const updatedCampaign = await campaignCollection.findOne(
      { id: campaign.id },
      { projection: { _id: 0 } }
    );

    return NextResponse.json(
      { ok: true, donation, campaign: updatedCampaign },
      { status: 201 }
    );
  } catch (error) {
    console.error('[api/fundraising/[id]/donate POST]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No se pudo guardar la donación.' },
      { status: 500 }
    );
  }
}
