import SingleTrackClient from "./SingleTrackClient";

export default function Page({ params }: { params: { id: string } }) {
  return <SingleTrackClient id={params.id} />;
}
