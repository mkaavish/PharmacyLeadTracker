import PharmacyDetailClient from "@/components/pharmacy-detail/PharmacyDetailClient";

type Params = { params: Promise<{ id: string }> };

export default async function PharmacyDetailPage({ params }: Params) {
  const { id } = await params;
  return <PharmacyDetailClient id={parseInt(id)} />;
}
