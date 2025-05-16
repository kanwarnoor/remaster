import SingleTrackClient from "./SingleTrackClient";

export default async function Page({ params }: { params: { id: string } }) {
  return <SingleTrackClient id={params.id} />;
}
