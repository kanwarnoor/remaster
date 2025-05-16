import SingleTrackClient from "./SingleTrackClient";

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;
  return <SingleTrackClient id={id} />;
}
